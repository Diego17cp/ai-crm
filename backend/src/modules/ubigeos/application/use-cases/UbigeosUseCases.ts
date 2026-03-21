import { IUbigeosRepository } from "../ports/IUbigeosRepository";

export class UbigeosUseCases {
    constructor(private repo: IUbigeosRepository) {}
    async getAllUbigeos() {
        return this.repo.findAll();
    }
}