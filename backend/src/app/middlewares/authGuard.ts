import { NextFunction, Request, Response } from "express";
import { AppError } from "../../core/errors/AppError"; 
import { JwtTokenService } from "../../modules/auth/infrastructure/adapters/JwtTokenService"; 
import { AccessTokenPayload } from "../../modules/auth/application/ports/ITokenService";


export interface AuthRequest extends Request {
    user?: AccessTokenPayload;
}

const tokenService = new JwtTokenService();

export const authGuard = (req: AuthRequest, _: Response, next: NextFunction) => {
    const token =  req.cookies?.accessToken;
    if (!token) throw new AppError("Unauthorized", 401);
    const decoded = tokenService.verifyAccessToken(token);
    if (!decoded) throw new AppError("Invalid token", 401);
    
    req.user = decoded;
    next();
}