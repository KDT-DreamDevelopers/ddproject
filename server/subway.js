import { MongoClient } from "mongodb";

const url = 'mongodb+srv://wnsvy1237:Dldzmtor15@cluster0.qorzsry.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(url);

const database = client.db("MoveOfDream");
const collection = database.collection("subways");

export async function getSubwayAddress(subwayName) {
    try {
        const findname = subwayName.slice(0, -1);
        console.log(findname);
        const findData = { "name": findname };
        const findResult = await collection.findOne(findData);

        const rawAddress = await findResult.address[0].split(" ");
        const address = await rawAddress.slice(0, rawAddress.length - 1).join(' ');
        return address;
    }
    catch (err) {
        console.error(err)
    }
}