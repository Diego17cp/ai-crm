import argon2 from "@node-rs/argon2";
import { IPasswordHasher } from "../../application/ports/IPasswordHasher";

export class Argon2PasswordHasher implements IPasswordHasher {
	async hash(password: string): Promise<string> {
		return await argon2.hash(password);
	}

	async verify(hash: string, password: string): Promise<boolean> {
		return await argon2.verify(hash, password);
	}
}