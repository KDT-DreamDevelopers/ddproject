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

const app = express()

app.use('/uploads', express.static('uploads'))
app.use(morgan("dev"))
app.use(bodyParser.json());
app.use(cors())
app.use(express.json())
app.use('/auth', authRouter)
app.use('/inquiry', inquiryRouter)
app.use('/report', reportRouter)


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
    
        for (let i=0; i< datas.length; i++){
            if( datas[i]["역개수"] ){
                if( datas[i]["역개수"].length === 0){
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

app.get("/isNear/:userX/:userY/:targetBusName", async (req, res) => {
    const { userX, userY, targetBusName } = req.params;
    console.log(targetBusName)
    const busReturn = await distanceWithUserAndBusstop(targetBusName);
    const busX = await busReturn[0];
    const busY = await busReturn[1];

    const distance = await getDistance(userX, userY, busX, busY);

    res.status(200).json(distance);
})

async function getDistance(userX, userY, busX, busY){
    if ((userX === busX) && (userY === busY)){
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

app.get("/clickstart/:busStopName/:busRoot", async(req, res) => {
    const { busStopName, busRoot } = req.params;
    const result = await getBestBusDriver(busStopName, busRoot);
    const returnResult = {
        "result": result
    }
    res.status(200).json(returnResult);
})


app.use((req,res,next)=>{
    res.sendStatus(404)
})

// DB연결
connectDB().then(db=>{
    console.log('init!')
    const server=app.listen(config.host.port, () => {
        console.log("http://localhost:8080에서 실행중");
    })
    // initSocket(server)  //나중에 할거
}).catch(console.error)