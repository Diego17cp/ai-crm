export interface IUbigeosRepository {
    findAll(): Promise<{ id: string; nombre: string }[]>;
}