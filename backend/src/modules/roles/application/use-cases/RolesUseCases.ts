import { IRoleRepository } from "../ports/IRoleRepository";

export class RolesUseCases {
    constructor(private roleRepository: IRoleRepository) {}
    async getAllRoles() {
        return await this.roleRepository.findAll();
    }
}