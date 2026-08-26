const sql = require('mssql');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function addMovieColumns() {
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

        // Check if columns already exist before adding
        const columnsToAdd = [
            { name: 'Genre', type: 'NVARCHAR(255)' },
            { name: 'Director', type: 'NVARCHAR(255)' },
            { name: 'Actors', type: 'NVARCHAR(500)' },
            { name: 'Runtime', type: 'NVARCHAR(50)' },
            { name: 'imdbRating', type: 'NVARCHAR(10)' },
            { name: 'Plot', type: 'NVARCHAR(MAX)' }
        ];

        for (const col of columnsToAdd) {
            // Check if column exists
            const checkResult = await pool.request().query(`
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'WatchlistItems' 
                AND COLUMN_NAME = '${col.name}'
            `);

            if (checkResult.recordset[0].count === 0) {
                console.log(`Adding column: ${col.name}...`);
                await pool.request().query(`
                    ALTER TABLE WatchlistItems 
                    ADD ${col.name} ${col.type} NULL
                `);
                console.log(`✅ Column ${col.name} added`);
            } else {
                console.log(`⏭️ Column ${col.name} already exists, skipping`);
            }
        }

        console.log('🎉 Migration complete! All columns added successfully.');
        await pool.close();
        process.exit(0);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

addMovieColumns();