import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "@/config";
import { errorHandler } from "./middlewares";
import router from "./routes";
import path from "node:path";
import pinoHttp, { Options } from "pino-http";

export const app: Application = express();

const pinoOptions: Options = {
	serializers: {
		req: (req: any) => ({
			method: req.method,
			url: req.url,
			headers: {
				origin: req.headers?.origin,
				cookie: req.headers?.cookie,
			},
		}),
		res: (res: any) => {
			const rawRes = res.raw || res;
			return {
				statusCode: rawRes.statusCode,
				headers: {
					"set-cookie": typeof rawRes.getHeader === "function" 
						? rawRes.getHeader("set-cookie") 
						: rawRes._headers?.["set-cookie"] || rawRes.headers?.["set-cookie"],
				},
			};
		},
	},
};
if (env.NODE_ENV !== "production") {
	pinoOptions.transport = {
		target: "pino-pretty",
		options: { colorize: true },
	};
}

app.use(pinoHttp(pinoOptions));

app.use(
	cors({
		origin: env.FRONTEND_URL,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Client-Platform"],
		credentials: true,
	}),
);
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				"frame-ancestors": ["'self'", env.FRONTEND_URL],
			},
		},
		crossOriginResourcePolicy: { policy: "cross-origin" },
	}),
);
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

app.get("/", (_, res) => {
	res.json({
		message: "API",
		status: "running",
		timestamp: new Date().toISOString(),
	});
});

app.use("/api", router);
// app.use(staticMiddleware);
app.use(errorHandler);
