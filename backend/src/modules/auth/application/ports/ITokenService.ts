export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  id: string; 
  email: string; 
  id_rol: number;
}

export interface ITokenService {
  generateTokens(payload: AccessTokenPayload): AuthTokenPair;
  verifyRefreshToken(token: string): { userId: string } | null;
  verifyAccessToken(token: string): AccessTokenPayload | null;
}
