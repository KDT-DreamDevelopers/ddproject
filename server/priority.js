import { MongoClient } from "mongodb"
import { getBestBusDriver } from "./busdriver.js";
const subwayList = [
    "1호선",
    "2호선",
    "3호선",
    "4호선",
    "5호선",
    "6호선",
    "7호선",
    "8호선",
    "9호선",
    "호선",
    "신분당선",
    "분당선",
    "공항철도",
    "인천1호선",
    "인천2호선",
    "경의중앙선",
    "경춘선"
]
export class MakePriorityAboutPath {
    constructor(pathList) {
        this.pathList = pathList;
        this.scoreList = [];
        this.url = config.db.host
        this.client = new MongoClient(this.url);
        this.database = this.client.db('MoveOfDream');
        this.collection = this.database.collection('subways');
    }

    async isThereLiftOrElevator() {
        let scoreIndex = 0;

        for (const onePathList of this.pathList) {
            this.scoreList.push(0);
            let isSubway = false;
            for (let i = 0; i < onePathList["정류장ID"].length; i++) {
                if (subwayList.includes(onePathList["호선노선"][i])) {
                    isSubway = true;
                    const findData = { name: onePathList["탑승지"][i].slice(0, -1).split("(")[0] };
                    const findResult = await this.collection.findOne(findData);
                    if (findResult === null) {
                        this.pathList.splice(this.scoreList.length - 1, 1);
                        this.scoreList.pop();
                        break;
                    } else {
                        const numElev = findResult["elevLOC"].length;
                        const numLift = findResult["liftLOC"].length;
                        this.scoreList[scoreIndex] += numElev + numLift;
                        scoreIndex++;
                    }
                } else {
                    //  버스인 경우 해당 버스가 언제 도착하는지 소요시간에 추가
                    this.scoreList[this.scoreList.length - 1] += 3;
                    const tmpdata = await getBestBusDriver(onePathList["정류장ID"][i], onePathList["호선노선"][i]);

                    if (tmpdata && tmpdata.arrmsg1 && (await tmpdata.arrmsg1[0] === "운행종료" || await tmpdata.arrmsg1[0] === "출발대기")) {
                        this.pathList.splice(this.scoreList.length - 1, 1);
                        this.scoreList.pop();
                        break;
                    } else {
                        scoreIndex++;
                    }
                }
            }
        }
    }

    async lengthOfTransfer() {
        const basicScore = 50;
        let idx = 0;
        for (const onePathList of this.pathList) {
            if (onePathList) {
                const howMany = onePathList['탑승지'].length;
                this.scoreList[idx] += basicScore - Math.pow(howMany, 2);
                idx += 1;
            }
        }
    }

    async lengthOfWalk() {
        const basicScore = 150;
        let idx = 0;
        for (const onePathList of this.pathList) {
            if (onePathList){
                const havingTime = parseInt(onePathList['소요시간'][0]);
                this.scoreList[idx] += basicScore - Math.pow(havingTime, 0.8);
                idx += 1;
            }
        }
    }

    async makeLastFiveData() {        
        const topFivePath = {};

        if ( this.pathList.length <= 5){
            for ( let i=0; i<this.pathList.length; i++){
                topFivePath[i] = this.pathList[i];
            }
        } else {
            for (let i = 0; i < 5; i++) {
                const index = this.findMaxIndex(this.scoreList);
                if (index != -1) {
                    topFivePath[i] = this.pathList[index];
                    this.scoreList[index] = 0;
                } else {
                    break;
                }
            }
        }
        return topFivePath;
    }

    findMaxIndex(list) {
        let maxIndex = -1;
        let maxValue = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < list.length; i++) {
            if (list[i] > maxValue) {
                maxValue = list[i];
                maxIndex = i;
            }
        }
        return maxIndex;
    }
}