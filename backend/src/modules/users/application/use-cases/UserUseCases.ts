import { IUserRepository } from "../ports/IUserRepository";
import { IPasswordHasher } from "../ports/IPasswordHasher";
import { User } from "../../domain/User";
import { UserAlreadyExistsError, UserNotFoundError } from "../../domain/errors";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/UserDTOs";

export class UserUseCases {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly passwordHasher: IPasswordHasher,
	) {}

	async createUser(dto: CreateUserDTO): Promise<User> {
		const existingEmail = await this.userRepository.findByEmail(dto.email);
		if (existingEmail) throw new UserAlreadyExistsError("El email ya está en uso");
		if (dto.telefono) {
			const existingPhone = await this.userRepository.findByPhone(dto.telefono);
			if (existingPhone) throw new UserAlreadyExistsError("El teléfono ya está en uso");
		}
		const password_hash = await this.passwordHasher.hash(dto.password_plain);

		const user = new User({
			id_rol: dto.id_rol,
			dni: dto.dni,
			nombres: dto.nombres,
			apellidos: dto.apellidos,
			email: dto.email,
			password_hash,
			telefono: dto.telefono || null,
			estado: "ACTIVO",
		});

		return await this.userRepository.create(user);
	}

	async getUserById(id: string): Promise<User> {
		const user = await this.userRepository.findById(id);
		if (!user) throw new UserNotFoundError();
		return user;
	}

	async updateUser(id: string, dto: UpdateUserDTO): Promise<User> {
		const user = await this.userRepository.findById(id);
		if (!user) throw new UserNotFoundError();

		return await this.userRepository.update(
			id,
			new User({ ...user.props, ...dto }),
		);
	}

	async deleteUser(id: string): Promise<void> {
		const user = await this.userRepository.findById(id);
		if (!user) throw new UserNotFoundError();
		await this.userRepository.delete(id);
	}
}
