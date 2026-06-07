import { getPool } from '../utils/db';

export interface User {
    id?: number;
    username: string;
    email: string;
    password: string;
    created_at?: Date;
}

export class UserRepository {

    // Create a new user
    async create(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
        const pool = getPool();
        const result = await pool.request()
            .input('username', user.username)
            .input('email', user.email)
            .input('password', user.password)
            .query(`
                INSERT INTO Users (username, email, password)
                OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.created_at
                VALUES (@username, @email, @password)
            `);

        return result.recordset[0];
    }

    // Find user by email
    async findByEmail(email: string): Promise<User | null> {
        const pool = getPool();
        const result = await pool.request()
            .input('email', email)
            .query('SELECT * FROM Users WHERE email = @email');

        return result.recordset[0] || null;
    }

    // Find user by username
    async findByUsername(username: string): Promise<User | null> {
        const pool = getPool();
        const result = await pool.request()
            .input('username', username)
            .query('SELECT * FROM Users WHERE username = @username');

        return result.recordset[0] || null;
    }

    // Find user by ID
    async findById(id: number): Promise<User | null> {
        const pool = getPool();
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Users WHERE id = @id');

        return result.recordset[0] || null;
    }
}