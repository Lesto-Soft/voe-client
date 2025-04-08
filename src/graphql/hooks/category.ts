import { useQuery } from "@apollo/client";
import { GET_CATEGORIES } from "../query/category";

export const useGetCategories = (
  query: string = "",
  itemsPerPage: number = 50,
  currentPage: number = 0
) => {
  const { loading, error, data, refetch } = useQuery(GET_CATEGORIES, {
    variables: {
      input: {
        itemsPerPage,
        currentPage,
        query,
      },
    },
  });
  return {
    loading,
    error,
    categories: data,
    refetch,
  };
};
