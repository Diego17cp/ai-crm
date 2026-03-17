import { AuthUser } from "../../domain/AuthUser";

export interface IAuthUserRepository {
	findByEmail(email: string): Promise<AuthUser | null>;
	findById(id: string): Promise<AuthUser | null>;
}
