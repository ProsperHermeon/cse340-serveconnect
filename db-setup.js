// ---------------------------------------------------------------------------
// db-setup.js
// Runs src/setup.sql against DB_URL and prints a verification summary.
// Usage:  npm run db:setup
// ---------------------------------------------------------------------------

import 'dotenv/config';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const sql = await fs.readFile(path.join(__dirname, 'src', 'setup.sql'), 'utf8');
        console.log('Running src/setup.sql ...');
        await pool.query(sql);
        console.log('setup.sql executed successfully.\n');

        const counts = await pool.query(`
            SELECT 'organizations'  AS table_name, COUNT(*) AS rows FROM organization
            UNION ALL SELECT 'projects',           COUNT(*) FROM project
            UNION ALL SELECT 'categories',         COUNT(*) FROM category
            UNION ALL SELECT 'project_category',   COUNT(*) FROM project_category;
        `);
        console.table(counts.rows);
    } catch (error) {
        console.error('Database setup failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

run();
