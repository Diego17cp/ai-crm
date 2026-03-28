import { RoleDTO } from "../../domain/dtos";

export interface IRoleRepository {
    findAll(): Promise<RoleDTO[]>;
}