import { connectDB } from './utils/db';

async function test() {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT DB_NAME() as database_name');
        console.log('Connected to database:', result.recordset[0].database_name);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();