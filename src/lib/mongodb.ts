// src/lib/mongodb.ts
import {MongoClient, Db, ConnectOptions} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI || !MONGODB_DB) {
    throw new Error('MongoDB connection details are missing in the environment variables.');
}

let cachedClient: MongoClient | undefined;
let cachedDb: Db | undefined;

export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(MONGODB_URI as string, { }  as ConnectOptions);
    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}
