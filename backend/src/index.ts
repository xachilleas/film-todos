import express from "express";
import cors from "cors";
import { connectDB } from "./utils/db";
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { authMiddleware } from './middleware/auth';
import moviesRoutes from './routes/moviesRoutes';



dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


// Test database connection when server starts
connectDB().catch(error => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/api/ping", (req, res) => {
    res.json({ message: "pong" });
});

// Test database route (temporary - will be removed later)
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await connectDB();
        res.json({ message: "Database connected successfully", timestamp: new Date() });
    } catch (error) {
        res.status(500).json({ error: "Database connection failed" });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/protected-test', authMiddleware, (req, res) => {
    res.json({
        message: 'You are authenticated!',
        userId: req.userId
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

