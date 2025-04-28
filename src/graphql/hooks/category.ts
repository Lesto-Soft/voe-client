import { useQuery } from "@apollo/client";
import { GET_ACTIVE_CATEGORIES } from "../query/category";
import { ICategory } from "../../db/interfaces";

// Hook to fetch active categories (can be extended with search later if needed)
export const useGetActiveCategories = () => {
  const { loading, error, data, refetch } = useQuery<{
    getLeanActiveCategories: ICategory[];
  }>(GET_ACTIVE_CATEGORIES);

  return {
    loading,
    error,
    categories: data?.getLeanActiveCategories || [], // Ensure default empty array
    refetch,
  };
};
