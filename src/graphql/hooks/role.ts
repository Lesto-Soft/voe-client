import { useQuery } from "@apollo/client";
import { GET_ROLES } from "../query/role";

export const useGetRoles = () => {
  const { loading, error, data, refetch } = useQuery(GET_ROLES, {});
  return {
    loading,
    error,
    roles: data,
    refetch,
  };
};
