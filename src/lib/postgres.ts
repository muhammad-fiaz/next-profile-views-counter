// src/lib/postgres.ts
import { Pool } from 'pg';

let pool: Pool;

export async function getDatabase() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL, // Update with your PostgreSQL connection string
            ssl: {
                rejectUnauthorized: false, // Disables certificate validation. Use with caution!
            },
        });

        // Ensure the 'views' table exists
        await pool.query(`
      CREATE TABLE IF NOT EXISTS views (
        username TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
      );
    `);
    }

    return pool;
}
