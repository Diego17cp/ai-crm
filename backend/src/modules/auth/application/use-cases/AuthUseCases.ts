import { IAuthUserRepository } from "../ports/IAuthUserRepository";
import { IPasswordHasher } from "../ports/IPasswordHasher";
import { ITokenService, AuthTokenPair } from "../ports/ITokenService";
import { LoginDTO } from "../dtos/AuthDTOs";
import {
	InvalidCredentialsError,
	UnauthorizedUserError,
	InvalidTokenError,
} from "../../domain/errors";
import { AuthUser } from "../../domain/AuthUser";

export class AuthUseCases {
	constructor(
		private readonly authUserRepo: IAuthUserRepository,
		private readonly passwordHasher: IPasswordHasher,
		private readonly tokenService: ITokenService,
	) {}

	async login(dto: LoginDTO): Promise<{
		user: Omit<AuthUser["props"], "password_hash">;
		tokens: AuthTokenPair;
	}> {
		const user = await this.authUserRepo.findByEmail(dto.email);
		if (!user) throw new InvalidCredentialsError();

		if (!user.isActive) throw new UnauthorizedUserError("El usuario está inactivo");

		const isValid = await this.passwordHasher.verify(
			user.passwordHash,
			dto.password_plain,
		);
		if (!isValid) throw new InvalidCredentialsError();

		const payload = {
			id: user.id,
			email: user.email,
			id_rol: user.props.id_rol,
		};
		const tokens = this.tokenService.generateTokens(payload);

		const { password_hash, ...userResponse } = user.props;
		return { user: userResponse, tokens };
	}

	async refresh(
		refreshToken: string,
	): Promise<{
		user: Omit<AuthUser["props"], "password_hash">;
		tokens: AuthTokenPair;
	}> {
		const decoded = this.tokenService.verifyRefreshToken(refreshToken);
		if (!decoded || !decoded.userId) throw new InvalidTokenError();

		const user = await this.authUserRepo.findById(decoded.userId);
		if (!user || !user.isActive) throw new UnauthorizedUserError();

		const payload = {
			id: user.id,
			email: user.email,
			id_rol: user.props.id_rol,
		};
		const tokens = this.tokenService.generateTokens(payload);

		const { password_hash, ...userResponse } = user.props;
		return { user: userResponse, tokens };
	}
}
