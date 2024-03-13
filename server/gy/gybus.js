// 버스이용 경로 조회

import cors from "cors";
import express from "express";
import fetch from "node-fetch";
import { parseString } from "xml2js";
import { promisify } from "util";

const app = express();
app.use(cors());
const useParse = promisify(parseString);

export async function gybus(startX, startY, endX, endY) {
    try {
        let li = [];
        const link = `http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoByBus?ServiceKey=KAyp/hPyUMMYcCnJrWIbGDxK7cOFEqB3LvjDI5ucUaBXcugRIDmWSYjwst6d78QMtq7O22pkuiM8OeNfzaJXIA==&startX=${startX}&startY=${startY}&endX=${endX}&endY=${endY}`

        const response = await fetch(link);
        const xmldata = await response.text();
        // XML 데이터를 JSON으로 변환
        const result = await useParse(xmldata);

        // JSON 데이터를 콘솔에 출력 및 변수에 저장
        const items = await result.ServiceResult.msgBody[0].itemList;

        console.log("gy bus 함수 실행");

        // 각각의 dic을 담을 배열 초기화
        let fidList = []
        let fnameList = [];
        let routeNmList = [];
        let tnameList = [];
        let timeList = [];
        
        items.forEach((bodyItem) => {
            if (bodyItem.time !== undefined) {
                timeList.push(bodyItem.time[0]);
            }
            bodyItem.pathList.forEach((listItem) => {
                if (listItem.fid !== undefined){
                    fidList.push(listItem.fid[0]);
                }
                if (listItem.fname !== undefined) {
                    fnameList.push(listItem.fname[0]);
                }
                if (listItem.routeNm !== undefined) {
                    routeNmList.push(listItem.routeNm[0]);
                }
                if (listItem.tname !== undefined) {
                    tnameList.push(listItem.tname[0]);
                }
            });

            // 각 dic을 li 배열에 추가
            let dic = {
                "정류장ID": fidList,
                "탑승지": fnameList,
                "호선노선": routeNmList,
                "하차지": tnameList,
                "소요시간": timeList
            };
            li.push(dic);

            // 다음 아이템을 위해 배열 초기화
            fidList = [];
            fnameList = [];
            routeNmList = [];
            tnameList = [];
            timeList = [];
        });
        return li;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};