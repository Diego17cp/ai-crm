import { setupShutdown, startDatabase, startHttpServer } from './bootstrap';
const start = async () => {
    try {
        await startDatabase();
        const server = startHttpServer();
        setupShutdown(server);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
start();