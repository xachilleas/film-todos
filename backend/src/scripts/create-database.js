const sql = require('mssql');
const path = require('path');
// .env is two levels up (from src/scripts to backend root)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function setupDatabase() {
    try {
        const masterConfig = {
            server: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '50720'),
            database: 'master',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            options: { trustServerCertificate: true }
        };

        console.log('Connecting to SQL Server...');
        const masterPool = await sql.connect(masterConfig);

        const dbName = process.env.APP_DATABASE || 'FilmTodosDB';
        const result = await masterPool.request().query(`SELECT name FROM sys.databases WHERE name = '${dbName}'`);

        if (result.recordset.length === 0) {
            console.log(`Creating ${dbName} database...`);
            await masterPool.request().query(`CREATE DATABASE ${dbName}`);
            console.log('✅ Database created');
        } else {
            console.log('✅ Database already exists');
        }

        await masterPool.close();

        const appConfig = {
            server: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '50720'),
            database: dbName,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            options: { trustServerCertificate: true }
        };

        const appPool = await sql.connect(appConfig);

        await appPool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
            CREATE TABLE Users (
                id INT IDENTITY(1,1) PRIMARY KEY,
                username NVARCHAR(100) UNIQUE NOT NULL,
                email NVARCHAR(255) UNIQUE NOT NULL,
                password NVARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT GETDATE()
            )
        `);
        console.log('✅ Users table ready');

        await appPool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WatchlistItems' AND xtype='U')
            CREATE TABLE WatchlistItems (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT NOT NULL,
                imdb_id NVARCHAR(50) NOT NULL,
                title NVARCHAR(255) NOT NULL,
                year NVARCHAR(10),
                poster NVARCHAR(500),
                added_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
                CONSTRAINT UQ_UserMovie UNIQUE(user_id, imdb_id)
            )
        `);
        console.log('✅ WatchlistItems table ready');

        console.log('🎉 Database setup complete!');
        await appPool.close();
        process.exit(0);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

setupDatabase();