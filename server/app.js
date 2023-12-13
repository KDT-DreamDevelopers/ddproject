import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import authRouter from './router/auth.js'
import inquiryRouter from './router/inquiry.js'
import { config } from './config.js'
import { connectDB } from './db/database.js';
import bodyParser from "body-parser";
import { MakePriorityAboutPath } from "../front/dest/priority.js"
import { gybus_and_subway_transfer } from "../front/dest/gy/gybus-and-subway-transfer.js";
import { gybus } from "../front/dest/gy/gybus.js";
import { gysubway } from "../front/dest/gy/gysubway.js";

const app = express()

app.use('/uploads', express.static('uploads'))
app.use(morgan("dev"))
app.use(bodyParser.json());
app.use(cors())
app.use(express.json())
app.use('/auth', authRouter)
app.use('/inquiry', inquiryRouter)


app.get("/send/:startX/:startY/:endX/:endY", async (req, res) => {
    const { startX, startY, endX, endY } = req.params;
    let datas = [];

    try {
        const result_transfer = await gybus_and_subway_transfer(startX, startY, endX, endY);
        datas = await datas.concat(result_transfer);

        const result_bus = await gybus(startX, startY, endX, endY);
        datas = await datas.concat(result_bus);

        const result_sub = await gysubway(startX, startY, endX, endY);
        datas = await datas.concat(result_sub);
    

        for (let i=0; i< datas.length; i++){
            if( datas[i]["역개수"] ){
                if( datas[i]["역개수"].length === 0){
                    delete datas[i]["역개수"]
                }
            }
        }

        console.log(datas.length)

        const uniqueSet = new Set(datas.map(item => JSON.stringify(item)));
        const uniqueData = Array.from(uniqueSet, JSON.parse);


        console.log(uniqueData.length)


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
