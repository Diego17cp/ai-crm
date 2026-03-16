import { app } from "@/app"
import { env } from "@/config"

export const startHttpServer = () => {
    const server = app.listen(env.PORT, () => {
        console.info(`Server running on port http://localhost:${env.PORT} in ${env.NODE_ENV} mode.`);
    });
    return server;
}