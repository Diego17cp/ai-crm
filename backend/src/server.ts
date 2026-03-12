import http from 'http';
import { app } from '@/app';
import { /*DatabaseConnection,*/ env } from '@/config';

const server = http.createServer(app);

const start = async () => {
    try {
        // await DatabaseConnection.getInstance().connect();
        server.listen(env.PORT, () => {
            console.log(`Server running on port http://localhost:${env.PORT} in ${env.NODE_ENV} mode.`);
        })
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
start();