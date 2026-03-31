import { setupShutdown, startDatabase, startHttpServer } from './bootstrap';
import { startWebsocket } from './bootstrap/startWebsocket';
const start = async () => {
    try {
        await startDatabase();
        const server = startHttpServer();
        startWebsocket(server);
        setupShutdown(server);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
start();