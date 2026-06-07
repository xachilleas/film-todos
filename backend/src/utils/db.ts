import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '50720'),
    database: process.env.APP_DATABASE || 'FilmTodosDB',  // Now using FilmTodosDB
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        trustServerCertificate: true
    }
};

let connectionPool: sql.ConnectionPool | null = null;

export const connectDB = async () => {
    if (!connectionPool) {
        connectionPool = await sql.connect(config);
        console.log('✅ Connected to FilmTodosDB');
    }
    return connectionPool;
};

export const getPool = () => {
    if (!connectionPool) {
        throw new Error('Database not connected. Call connectDB first.');
    }
    return connectionPool;
};

export default sql;