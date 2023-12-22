// src/lib/sqlite.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let dbInstance: Database;

export async function getDatabase() {
    if (!dbInstance) {
        dbInstance = await open({
            filename: 'views.db',
            driver: sqlite3.Database,
        });

        await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS views (
        username TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
      );
    `);
    }

    return dbInstance;
}
