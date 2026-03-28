import { User } from "../../domain/User";
import { GetUsersQueryDTO, PaginatedUsersResult, UserDTO } from "../dtos/UserDTOs";

export interface IUserRepository {
	findAll(query: GetUsersQueryDTO): Promise<PaginatedUsersResult<UserDTO>>;
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	findByPhone(phone: string): Promise<User | null>;
	create(user: User): Promise<User>;
	update(id: string, user: Partial<User>): Promise<User>;
	delete(id: string): Promise<void>;
}
