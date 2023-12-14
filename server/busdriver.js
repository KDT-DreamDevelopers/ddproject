import cors from "cors";
import express from "express";
import fetch from "node-fetch";
import { parseString } from "xml2js";
import { promisify } from "util";
import { MongoClient } from "mongodb"
import { getBusStopIds } from "./distanceUserBus.js";

const app = express();
app.use(cors());
const useParse = promisify(parseString);
const url = 'mongodb+srv://wnsvy1237:Dldzmtor15@cluster0.qorzsry.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url);
const database = client.db("MoveOfDream");
const collection = database.collection("busstops");

export async function getBestBusDriver(busStopName, busroot) {
    const sttn_ids = await getBusStopIds(busStopName);
    const serviceKey = "pfd4dRtU1pToMhVnnHd/c+f1ZzzxJB6LVx4vEo4pDb7mkR03a4x6I59qRDPT2armrzGE9XYZvXV7D8VtSyEsKg=="
    let result = [];
    for (let j = 0; j < sttn_ids.length; j++) {
        const fetchLink = `http://ws.bus.go.kr/api/rest/arrive/getLowArrInfoByStId?ServiceKey=${serviceKey}&stId=${sttn_ids[j]}`;
        
        const response = await fetch(fetchLink);
        const xmldata = await response.text();
        const alldata = await useParse(xmldata);
        const rawdataList = await alldata.ServiceResult.msgBody[0].itemList

        if (rawdataList) {
            for (let i = 0; i < await rawdataList.length; i++) {
                let tmpData = {
                    arrmsg1: await rawdataList[i].arrmsg1,
                    arrmsg2: await rawdataList[i].arrmsg2,
                    arsId: await rawdataList[i].arsId,
                    busType1: await rawdataList[i].busType1,
                    busType2: await rawdataList[i].busType2,
                    exps1: await rawdataList[i].exps1,
                    exps2: await rawdataList[i].exps2,
                    full1: await rawdataList[i].full1,
                    full2: await rawdataList[i].full2,
                    vehId1: await rawdataList[i].vehId1,
                    vehId2: await rawdataList[i].vehId2,
                    rtNm: await rawdataList[i].rtNm
                }
                
                if (await tmpData.rtNm[0] === busroot) {
                    result.push(tmpData);
                }
            }
        }
    }
    return result


    // arrmsg1 : 첫번째 도착예정 버스의 도착정보메세지
    // arrmsg2 : 두번째 도착예정 버스의 도착정보메세지
    // arsId : 정류소 번호
    // busType1 : 첫번째 도착예정 버스의 차량유형 (저상버스가 1번)
    // busType2 : 두번째 도착예정 버스의 차량유형 (저상버스가 1번)
    // dir : 방향
    // exps1 : 첫번째 도착예정 버스의 도착예정시간(s)
    // exps2 : 두번째 도착예정 버스의 도착예정시간(s)
    // full1 : 첫번째 도착예정버스의 만차여부
    // full2 : 두번째 도착예정버스의 만차여부
    // vehId1 : 1번째 도착예정 버스의 Id
    // vehId2 : 2번째 도착예정 버스의 Id
    // rtNm : 버스번호
}