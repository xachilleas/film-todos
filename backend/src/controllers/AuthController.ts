import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';

export class AuthController {
    private userRepository: UserRepository;
    constructor() {
        this.userRepository = new UserRepository();
    }
    register = async (req: Request, res: Response): Promise<void> => {
        const { username, email, password } = req.body;

        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            res.status(400).json({message: "Email already registered"});
            return;
        }
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await this.userRepository.create({
                username,
                email,
                password: hashedPassword
            });

            const token = jwt.sign(
                { userId: newUser.id, email: newUser.email },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d'}
            );

            res.status(201).json({
                message: "User registered successfully",
                token: token,
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                }
            });
        }

        login = async (req: Request, res: Response): Promise<void> => {
        const { email, password } = req.body;

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            {expiresIn: '7d' }
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
        }
    }