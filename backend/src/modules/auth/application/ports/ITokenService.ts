export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  id: string; 
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  rol: string;
  estado: string;
  isActive: boolean;
}

export interface ITokenService {
  generateTokens(payload: AccessTokenPayload): AuthTokenPair;
  verifyRefreshToken(token: string): { userId: string } | null;
  verifyAccessToken(token: string): AccessTokenPayload | null;
}
