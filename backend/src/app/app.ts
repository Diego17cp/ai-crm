import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import cookieParser from 'cookie-parser';
import { env } from '@/config'
// import { DatabaseConnection } from '@/config';
// import router from './routes';
// import { errorHandler, staticMiddleware } from './middlewares';


export const app: Application = express();

app.use(cors({
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', "X-Client-Platform"],
    credentials: true,
}))
app.use(helmet());
app.use(express.json());
// app.use(cookieParser());

app.get('/', (_, res) => {
    res.json({
        message: "API",
        status: "running",
        // database: DatabaseConnection.getInstance().getStatus(),
        timestamp: new Date().toISOString()
    });
})

// app.use("/api", router);
// app.use(staticMiddleware);
// app.use(errorHandler);