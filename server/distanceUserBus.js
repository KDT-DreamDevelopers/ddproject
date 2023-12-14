import { MongoClient } from "mongodb"

const url = 'mongodb+srv://wnsvy1237:Dldzmtor15@cluster0.qorzsry.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(url);

const database = client.db("MoveOfDream");
const collection = database.collection("busstops");

export async function distanceWithUserAndBusstop(busstopName) {
    const findData = { sttn_nm: busstopName };
    const findResult = await collection.findOne(findData);
    const busX = await findResult.crdnt_x;
    const busY = await findResult.crdnt_y;
    return [await busX, await busY]
}