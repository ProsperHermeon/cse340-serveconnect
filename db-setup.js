// ---------------------------------------------------------------------------
// db-setup.js
//
// Convenience runner: executes src/setup.sql against the database in DB_URL,
// then prints a verification summary. This does exactly what pasting setup.sql
// into the pgAdmin Query Tool would do — it is just faster and repeatable.
//
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
    ssl: {
        rejectUnauthorized: false
    }
});

const run = async () => {
    try {
        const sqlPath = path.join(__dirname, 'src', 'setup.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');

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

        const sample = await pool.query(`
            SELECT p.title, o.name AS organization_name, p.project_date
            FROM project p
            JOIN organization o ON o.organization_id = p.organization_id
            ORDER BY p.project_date
            LIMIT 3;
        `);
        console.log('Sample JOIN result:');
        console.table(sample.rows);
    } catch (error) {
        console.error('Database setup failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

run();
