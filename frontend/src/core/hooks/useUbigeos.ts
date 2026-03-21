import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../api"
import type { UbigeoResponse } from "../types/ubigeos";

export const useUbigeos = () => {
    const getUbigeos = async () => {
        const response = await apiClient.get<UbigeoResponse>("/ubigeos");
        return response.data.data;
    }
    const ubigeosQuery = useQuery({
        queryKey: ["ubigeos"],
        queryFn: getUbigeos,
        staleTime: Infinity
    })
    return { ubigeosQuery };
}