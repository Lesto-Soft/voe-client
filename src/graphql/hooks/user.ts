import { useQuery } from "@apollo/client";
import { GET_ME, GET_USERS } from "../query/user";

export const useGetUsers = (
  query: string = "",
  itemsPerPage: number = 10,
  currentPage: number = 0
) => {
  const { loading, error, data, refetch } = useQuery(GET_USERS, {
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
    users: data,
    refetch,
  };
};

export const useGetMe = () => {
  const { loading, error, data, refetch } = useQuery(GET_ME);
  return {
    loading,
    error,
    me: data,
    refetch,
  };
};
