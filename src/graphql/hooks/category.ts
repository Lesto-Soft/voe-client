import { useQuery } from "@apollo/client";
import { GET_ACTIVE_CATEGORIES } from "../query/category";

export const useGetActiveCategories = () => {
  const { loading, error, data, refetch } = useQuery(GET_ACTIVE_CATEGORIES, {
    // fetchPolicy: "cache-first", //if a new category is updated it will not be shown until the page is refreshed manually
  });
  return {
    loading,
    error,
    categories: data,
    refetch,
  };
};
