import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ExpressAuth } from "@auth/express";
import { authConfig } from './features/auth/config.js';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Auth Setup
// Trust Proxy is crucial for OAuth callbacks to correctly identify 'https' vs 'http'
app.set('trust proxy', true);

// Sets up routes: /auth/signin, /auth/callback/google, /auth/signout
app.use('/auth', ExpressAuth(authConfig));

//Express Routes
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
});

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: 'Not Found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
