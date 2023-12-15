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
        }

        const priorityClass = new MakePriorityAboutPath(uniqueData);
        await priorityClass.isThereLiftOrElevator();
        await priorityClass.lengthOfTransfer();
        await priorityClass.lengthOfWalk();
        const topFivePath = await priorityClass.makeLastFiveData();

        res.status(200).json(topFivePath);
    }
    catch (error) {
        console.error(error)
    }
});

app.get("/isNearBus/:userX/:userY/:targetBusName", async (req, res) => {
    const { userX, userY, targetBusName } = req.params;
    console.log(targetBusName);
    const busReturn = await distanceWithUserAndBusstop(targetBusName);
    const busX = await busReturn[0];
    const busY = await busReturn[1];

    const distance = await getDistance(userX, userY, busX, busY);

    res.status(200).json(distance);
})

app.get("/isNearSubway/:targetSubwayName", async (req, res) => {
    const { targetSubwayName } = req.params
    const subwayAddr = await getSubwayAddress(targetSubwayName);

    res.status(200).json(subwayAddr);
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
 

app.get("/clickstart/:busStopName/:busRoot", async (req, res) => {
    const { busStopName, busRoot } = req.params;
    const result = await getBestBusDriver(busStopName, busRoot);
    const returnResult = {
        "result": result
    }
    res.status(200).json(returnResult);
})




const url = "mongodb+srv://jimini0920:JW4qxzzylk41IZe1@cluster0.kngcohp.mongodb.net/shop?retryWrites=true&w=majority"
// MongoDB 연결
Mongoose.connect(url);

// MongoDB 모델 정의
const pushToken = new Mongoose.Schema({
    token: { type: String, required: true },
    id: { type: String, required: true },
    bus_subway: { type: String, required: true }
})

const PushToken = Mongoose.model("Token", pushToken);
// 토큰 저장 엔드포인트
app.post('/api/save-token', async (req, res) => {
    const { token, id, bus_subway } = req.body;

    try {
        const pushToken = new PushToken({ token, id, bus_subway });
        await pushToken.save();
        res.status(200).json({ success: true, message: 'Token saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


const sendPushNotification = async (expoPushToken, message) => {
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
            title: "Push Notification Title",
            body: message,
        }),
    });
    const data = await response.json();
    console.log("Push notification sent:", data);
};


// 푸시 알림 보내기 엔드포인트
app.post('/ImOnTheBusStop/:targetBusStop/:targetBusRoot', async (req, res) => {
    try {
        const { targetBusStop, targetBusRoot } = req.params;

        const { expoPushToken, message, id, bus_subway } = req.body;

        // 특정 조건에 맞는 경우에만 푸시 알림 보내기
        if (bus_subway === 'bus' && id === 'your_specific_id') {
            await sendPushNotification(expoPushToken, message);
            res.status(200).json({ success: true, message: 'Push notification sent successfully' });
        } else {
            res.status(200).json({ success: false, message: 'Not eligible for push notification' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.use((req, res, next) => {
    res.sendStatus(404)
})

// DB연결
connectDB().then(db => {
    console.log('init!')
    const server = app.listen(config.host.port, () => {
        console.log("http://localhost:8080에서 실행중");
    })
    // initSocket(server)  //나중에 할거
}).catch(console.error)