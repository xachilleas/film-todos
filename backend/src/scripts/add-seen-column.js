const sql = require('mssql');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function addSeenColumn() {
    try {
        const dbName = process.env.APP_DATABASE || 'FilmTodosDB';

        const config = {
            server: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '50720'),
            database: dbName,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            options: { trustServerCertificate: true }
        };

        console.log(`Connecting to ${dbName}...`);
        const pool = await sql.connect(config);

        // Check if column exists
        const checkResult = await pool.request().query(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'WatchlistItems' 
            AND COLUMN_NAME = 'seen'
        `);

        if (checkResult.recordset[0].count === 0) {
            console.log('Adding column: seen...');
            await pool.request().query(`
                ALTER TABLE WatchlistItems 
                ADD seen BIT DEFAULT 0 NOT NULL
            `);
            console.log('✅ Column seen added with default value 0 (unseen)');
        } else {
            console.log('⏭️ Column seen already exists, skipping');
        }

        console.log('🎉 Migration complete!');
        await pool.close();
        process.exit(0);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

addSeenColumn();