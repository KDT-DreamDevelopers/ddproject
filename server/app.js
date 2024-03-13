import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import authRouter from './router/auth.js'
import inquiryRouter from './router/inquiry.js'
import reportRouter from './router/report.js'
import { config } from './config.js'
import { connectDB } from './db/database.js';
import bodyParser from "body-parser";
import { MakePriorityAboutPath } from "./priority.js"
import { gybus_and_subway_transfer } from "./gy/gybus-and-subway-transfer.js";
import { gybus } from "./gy/gybus.js";
import { gysubway } from "./gy/gysubway.js";
import { distanceWithUserAndBusstop } from "./distanceUserBus.js"
import { getBestBusDriver } from './busdriver.js'
import { getSubwayAddress } from './subway.js';
import fetch from 'node-fetch';
import Mongoose from 'mongoose';

const app = express()

app.use('/uploads', express.static('uploads'))
app.use(morgan("dev"))
app.use(bodyParser.json());
app.use(cors())
app.use(express.json())
app.use('/auth', authRouter)
app.use('/inquiry', inquiryRouter)
app.use('/report', reportRouter)
app.use(bodyParser.urlencoded({ extended: !0 }))


app.get("/send/:startX/:startY/:endX/:endY", async (req, res) => {
    const { startX, startY, endX, endY } = req.params;
    let datas = [];

    try {
        const result_transfer = await gybus_and_subway_transfer(startX, startY, endX, endY);
        datas = datas.concat(result_transfer);

        const result_bus = await gybus(startX, startY, endX, endY);
        datas = datas.concat(result_bus);

        const result_sub = await gysubway(startX, startY, endX, endY);
        datas = datas.concat(result_sub);

        for (let i = 0; i < datas.length; i++) {
            if (datas[i]["역개수"]) {
                if (datas[i]["역개수"].length === 0) {
                    delete datas[i]["역개수"]
                }
            }
        }

        const uniqueSet = new Set(datas.map(item => JSON.stringify(item)));
        const uniqueData = Array.from(uniqueSet, JSON.parse);

        if (datas.length === 0) {
            res.status(200).json({
                "0": null,
                "1": null,
                "2": null,
                "3": null,
                "4": null
            });
            return;
        }

        const priorityClass = new MakePriorityAboutPath(uniqueData);
        await priorityClass.isThereLiftOrElevator();
        await priorityClass.lengthOfTransfer();
        await priorityClass.lengthOfWalk();
        const topFivePath = await priorityClass.makeLastFiveData();
        res.status(200).json(topFivePath);
        return;
    }
    catch (error) {
        console.error(error)
    }
});

app.get("/isNearBus/:userX/:userY/:targetBusId", async (req, res) => {
    const { userX, userY, targetBusId } = req.params;
    try {
        const busReturn = await distanceWithUserAndBusstop(targetBusId);
        if (!busReturn) {
            res.status(400).json({ 'message': "에러발생" })
            return;
        }
        const busX = await busReturn[0];
        const busY = await busReturn[1];
        const distance = await getDistance(userX, userY, busX, busY);

        res.status(200).json(distance);
        return;
    } catch (error) {
        console.error(error);
        res.status(400).json({ "message": "에러발생" })
        return;
    }
})

app.get("/isNearSubway/:targetSubwayName", async (req, res) => {
    try {
        const { targetSubwayName } = req.params
        const subwayAddr = await getSubwayAddress(targetSubwayName);

        res.status(200).json(subwayAddr);
    } catch (error) {
        console.error(error);
        res.status(400).json({ "message": "에러발생" })
    }
})

async function getDistance(userX, userY, busX, busY) {
    if ((userX === busX) && (userY === busY)) {
        return 0;
    }
    var radLat1 = Math.PI * userX / 180;
    var radLat2 = Math.PI * busX / 180;
    var theta = userY - busY;
    var radTheta = Math.PI * theta / 180;
    var dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
    if (dist > 1)
        dist = 1;

    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515 * 1.609344 * 1000;
    if (dist < 100) dist = Math.round(dist / 10) * 10;
    else dist = Math.round(dist / 100) * 100;

    return dist;
}

// MongoDB 연결
let db;

const url = config.db.host;
try {
    const connection = await Mongoose.connect(url, {
        dbName: "MoveOfDream"
    })
    db = connection.connection;
} catch (error) {
    console.error(error);
}
// MongoDB 모델 정의
const pushTokenSchema = new Mongoose.Schema({
    token: { type: String, required: true },
    mId: { type: String, required: true }
})
const TokenModel = Mongoose.model("tokens", pushTokenSchema);

// 토큰 저장 엔드포인트
app.post('/api/save-token', async (req, res) => {
    const { token, id } = req.body;
    try {
        const exists = await TokenModel.findOne({ token });

        if (!exists) {
            let inputdata = {
                token: token,
                mId: id
            }
            let pushToken = new TokenModel(inputdata);
            await pushToken.save();
            res.status(200).json({ success: true, message: 'Token saved successfully' })
        } else {
            res.status(200).json({ success: false, message: 'Token already exists' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


const sendPushNotification = async (expoPushToken, message) => {
    try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: expoPushToken,
                sound: "default",
                title: "승차 알림!",
                body: JSON.stringify(message),
            }),
        });
    } catch (error) {
        console.error(error);
    }
};


// 버스 푸시 알림 보내기 엔드포인트
app.post("/ImOnTheBusStop", async (req, res) => {
    try {
        const { busStopId, busRoot, busStopName, userId } = req.body;
        const result = await getBestBusDriver(busStopId, busRoot);
        if (result === 0) {
            res.status(400).json({ message: "noPath" });
            return;
        }
        const findBusClue = { mId: result };
        const findBus = await TokenModel.findOne(findBusClue);
        if ( findBus ){
            const expoPushToken = findBus.token;
            const message = {
                message: busStopName,
                userId: userId
            };
            await sendPushNotification(expoPushToken, message);
            res.status(200).json({ success: true, message: 'Push notification sent successfully', onbus: result });
        }
        else{
            res.status(404).json({success: false, message: "Bus Error"})
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: "error incident"})
    }
})

app.post("/ImGoingToOut", async (req, res) => {
    try {
        const {  message, onbusid, userId } = req.body;
        const findBusClue = { mId: onbusid };
        const findBus = await TokenModel.findOne(findBusClue);
        const expoPushToken = findBus.token;
        const messages = {
            message: message,
            userId: userId
        }
        await sendPushNotification(expoPushToken, messages);
        res.status(200).json({ success: true, message: 'Push Notification sent successfully' })
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: "error incident" })
    }
})

app.post("/ImAlmostInSubway", async (req, res) => {
    try {
        const { targetSubId } = req.body;
        const findSubClue = { mId: targetSubId }
        const findSub = await TokenModel.findOne(findSubClue);
        if (findSub) {
            const expoPushToken = findSub.token;
            const message = {
                message: "AlmostThere",
                userId: "Subway"
            };
            await sendPushNotification(expoPushToken, message);
            res.status(200).json({ success: true, message: 'Push notification sent successfully' })
        }
        else {
            res.status(404).json({ success: false, message: "Subway Error" })
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: "error incident" })
    }
})

app.use((req, res, next) => {
    res.sendStatus(404)
})

// DB연결
connectDB().then(db => {
    const server = app.listen(config.host.port, () => {
        console.log("http://localhost:8080에서 실행중");
    })
}).catch(console.error)