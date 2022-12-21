import { Router } from "express";
import { chatGPTRoutes } from "./chatgpt-routes";

// Initialize the default router
export const defaultRoute = Router();

defaultRoute.use((_req, res, next) => {
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
});

defaultRoute.get("/", (_req, res) => {
    res.send("ChatGPT VSCode Plugin Extension API Server");
});

// Health Check
defaultRoute.get('/health', (req, res) => {
    const ip = req.headers['x-forwarded-for'] 
        || req.socket.remoteAddress
        || req.ip
        || req.ips
    console.info(`Health request from: '${ip}'`);
    res.status(200).send('Ok');
});

// Register all API routes
defaultRoute.use('/api', defaultRoute);
defaultRoute.use('/api/chat-gpt', chatGPTRoutes);
