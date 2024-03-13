import { MongoClient } from "mongodb";
import { config } from "./config.js"

const url = config.db.host;

const client = new MongoClient(url);

const database = client.db("MoveOfDream");
const collection = database.collection("busstops");

export async function distanceWithUserAndBusstop(busStopId) {
    try {
        const findData = { sttn_id: Number(busStopId) };
        if ( findData){
            const findResult = await collection.findOne(findData);
            const busX = await findResult.crdnt_x;
            const busY = await findResult.crdnt_y;
            return [await busX, await busY];
        }
    } catch (error){
        console.error(error);
        return;
    }
}

