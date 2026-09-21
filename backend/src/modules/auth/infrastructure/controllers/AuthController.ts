import { Request, Response, NextFunction } from "express";
import { AuthUseCases } from "../../application/use-cases/AuthUseCases";
import { env } from "@/config/env";
import { AuthRequest } from "@/app/middlewares/authGuard";
import { AppError } from "@/core/errors/AppError";

export class AuthController {
	private readonly isProd = env.NODE_ENV === "production";

	constructor(private readonly authUseCases: AuthUseCases) {}

	private getCookieOptions() {
		const isTunnel = env.API_URL?.includes("devtunnels.ms") || env.API_URL?.includes("ngrok");
		const useSecure = this.isProd || isTunnel;
		const sameSitePolicy = useSecure ? "none" : "lax";

		return {
			httpOnly: true,
			secure: useSecure,
			sameSite: sameSitePolicy as "none" | "lax" | "strict"
		};
	}

	private setCookies(
		res: Response,
		accessToken: string,
		refreshToken: string,
	) {
		const baseOptions = this.getCookieOptions();

		res.cookie("accessToken", accessToken, {
			...baseOptions,
			maxAge: 15 * 60 * 1000, // 15 min
			path: "/",
		});
		res.cookie("refreshToken", refreshToken, {
			...baseOptions,
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
			path: "/api/auth/refresh",
		});
	}

	login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password_plain } = req.body;
			const result = await this.authUseCases.login({
				email,
				password_plain,
			});

			this.setCookies(
				res,
				result.tokens.accessToken,
				result.tokens.refreshToken,
			);

			res.status(200).json({
				success: true,
				data: { user: result.user },
			});
		} catch (error) {
			next(error);
		}
	};

	refresh = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const refreshToken = req.cookies?.refreshToken;
			if (!refreshToken) {
				return res
					.status(401)
					.json({
						success: false,
						message: "No hay token proporcionado",
					});
			}

			const result = await this.authUseCases.refresh(refreshToken);

			this.setCookies(
				res,
				result.tokens.accessToken,
				result.tokens.refreshToken,
			);

			return res.status(200).json({
				success: true,
				data: { user: result.user },
			});
		} catch (error) {
			return next(error);
		}
	};

	logout = async (_: Request, res: Response) => {
		const baseOptions = this.getCookieOptions();

		res.clearCookie("accessToken", {
			...baseOptions,
			path: "/",
		});
		res.clearCookie("refreshToken", {
			...baseOptions,
			path: "/api/auth/refresh",
		});
		res.status(200).json({ success: true, message: "Sesión cerrada" });
	};

	me = async (req: AuthRequest, res: Response) => {
		if (!req.user) throw new AppError("Unauthorized", 401);
		return res.status(200).json({ success: true, data: req.user });
	}
}
