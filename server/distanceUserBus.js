import { MongoClient } from "mongodb"

const url = 'mongodb+srv://wnsvy1237:Dldzmtor15@cluster0.qorzsry.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(url);

const database = client.db("MoveOfDream");
const collection = database.collection("busstops");

export async function distanceWithUserAndBusstop(busstopName) {
    const findData = { STTN_NM: busstopName };
    const findResult = await collection.findOne(findData);
    const busstopLOC = await findResult.LOC;
    let tmp = await busstopLOC.split(",");
    const busX = await tmp[1].split(" ")[1].split(")")[0];
    const busY = await tmp[0].split("(")[1];
    return [await busX, await busY]
}