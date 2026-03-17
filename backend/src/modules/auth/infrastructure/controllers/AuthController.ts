import { Request, Response, NextFunction } from "express";
import { AuthUseCases } from "../../application/use-cases/AuthUseCases";
import { env } from "@/config/env";

export class AuthController {
	private readonly isProd = env.NODE_ENV === "production";

	constructor(private readonly authUseCases: AuthUseCases) {}

	private setCookies(
		res: Response,
		accessToken: string,
		refreshToken: string,
	) {
		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: this.isProd,
			sameSite: "strict",
			maxAge: 15 * 60 * 1000, // 15 min
			path: "/",
		});
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: this.isProd,
			sameSite: "strict",
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
		res.clearCookie("accessToken", {
			path: "/",
			httpOnly: true,
			secure: this.isProd,
			sameSite: "strict",
		});
		res.clearCookie("refreshToken", {
			path: "/api/auth/refresh",
			httpOnly: true,
			secure: this.isProd,
			sameSite: "strict",
		});
		res.status(200).json({ success: true, message: "Sesión cerrada" });
	};
}
