import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../api"
import type { SimpleData } from "@/shared/types"

export const useDocTypes = () => {
  const getDocTypes = async () => {
    const response = await apiClient.get<{ data: SimpleData[] }>("/tipos-documento")
    return response.data.data
  }
  const docTypesQuery = useQuery({
    queryKey: ["document-types"],
    queryFn: getDocTypes,
    staleTime: Infinity
  })
  return { docTypesQuery }
}