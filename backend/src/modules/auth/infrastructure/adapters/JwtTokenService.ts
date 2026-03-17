import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
	ITokenService,
	AuthTokenPair,
    AccessTokenPayload,
} from "../../application/ports/ITokenService";
import { env } from "@/config/env";

export class JwtTokenService implements ITokenService {
	generateTokens(payload: {
		id: string;
		email: string;
		id_rol: number;
	}): AuthTokenPair {
		const accessToken = jwt.sign(payload, env.JWT_SECRET, {
			expiresIn: "15m",
			// TODO: Ajustar issuer y audience según nombre del proyecto y cliente
			issuer: "backend",
			audience: "client",
		});

		const refreshToken = jwt.sign(
			{ userId: payload.id, jti: crypto.randomUUID() },
			env.JWT_SECRET_REFRESH,
			{ expiresIn: "30d" },
		);

		return { accessToken, refreshToken };
	}
	verifyAccessToken(token: string): AccessTokenPayload | null {
		try {
			return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
		} catch {
			return null;
		}
	}
	verifyRefreshToken(token: string): { userId: string } | null {
		try {
			return jwt.verify(token, env.JWT_SECRET_REFRESH) as {
				userId: string;
			};
		} catch {
			return null;
		}
	}
}
