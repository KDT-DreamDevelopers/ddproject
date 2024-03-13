import cors from "cors";
import express from "express";
import fetch from "node-fetch";
import { parseString } from "xml2js";
import { promisify } from "util";
import { MongoClient } from "mongodb"
import { config } from "./config.js"

const app = express();
app.use(cors());
const useParse = promisify(parseString);
const url = config.db.host;
const client = new MongoClient(url);
const database = client.db("MoveOfDream");
const collection = database.collection("busstops");

export async function getBestBusDriver(busStopId, busroot) {
    let result = [];
    try {
        const fetchLink = `http://ws.bus.go.kr/api/rest/arrive/getLowArrInfoByStId?serviceKey=QTopfVxZ8MZ1R8jXooRF5Z25dJ2cxSUQRKNzxqBUIqKqkhp%2BTkJlDWXhui3l3%2Fr5u8BqAbMCHpIBJF0twkWk4g%3D%3D&stId=${busStopId}`
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
                    exps1: await rawdataList[i].exps1,
                    exps2: await rawdataList[i].exps2,
                    vehId1: await rawdataList[i].vehId1,
                    vehId2: await rawdataList[i].vehId2,
                    rtNm: await rawdataList[i].rtNm
                }
                if (tmpData.rtNm[0] === busroot) {
                    result.push(tmpData);
                }
            }

            if (result.length >= 1) {
                const arrmsg1 = await result[0].arrmsg1[0];
                if (arrmsg1 === "운행종료" || arrmsg1 === "출발대기") {
                    return 0;
                }
                else {
                    const busId = result[0].vehId1[0];
                    return busId
                }
            } else {
                return 0;
            }
        }
    } catch (error) {
        console.error(error);
        return 0;
    }
}
