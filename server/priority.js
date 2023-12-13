import { MongoClient } from "mongodb"

export class MakePriorityAboutPath {
    constructor(pathList) {
        this.pathList = pathList;
        this.scoreList = [];
        this.url =
            'mongodb+srv://wnsvy1237:Dldzmtor15@cluster0.qorzsry.mongodb.net/?retryWrites=true&w=majority';
        this.client =  new MongoClient(this.url);
        this.database = this.client.db('MoveOfDream');
        this.collection = this.database.collection('subways');
    }

    async isThereLiftOrElevator() {
        for (const onePathList of this.pathList) {
            this.scoreList.push(0);
            let isSubway = false;
            for (const i of onePathList['탑승지']) {
                if (i.slice(-1) === '역') {
                    isSubway = true;
                    const findData = { name: i.slice(0, -1).split('(')[0] };
                    const findResult = await this.collection.findOne(findData);
                    if (findResult === null) {
                        this.scoreList[this.scoreList.length - 1] += 3;
                        continue;
                    }
                    const numElev = findResult['elevLOC'].length;
                    const numLift = findResult['liftLOC'].length;
                    this.scoreList[this.scoreList.length - 1] += numElev + numLift;
                } else {
                    this.scoreList[this.scoreList.length - 1] += 3;
                }
            }
            if (isSubway && this.scoreList[this.scoreList.length - 1] === 0) {
                this.pathList.splice(this.pathList.indexOf(onePathList), 1);
                this.scoreList.pop();
            }
        }
    }

    async lengthOfTransfer() {
        const basicScore = 50;
        let idx = 0;
        for (const onePathList of this.pathList) {
            const howMany = onePathList['탑승지'].length;
            this.scoreList[idx] += basicScore - Math.pow(howMany, 2);
            idx += 1;
        }
    }

    async lengthOfWalk() {
        const basicScore = 150;
        let idx = 0;
        for (const onePathList of this.pathList) {
            const havingTime = parseInt(onePathList['소요시간'][0]);
            this.scoreList[idx] += basicScore - Math.pow(havingTime, 0.8);
            idx += 1;
        }
    }

    async makeLastFiveData() {
        const topFivePath = {};
        for (let i = 0; i < 5; i++) {
            const index = this.findMaxIndex(this.scoreList);
            topFivePath[i] = this.pathList[index];
        }
        return topFivePath;
    }

    findMaxIndex(list) {
        const M = Math.max(...list);
        const index = list.indexOf(M);
        list[index] = 0;
        return index;
    }
}
