import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS, COUNT_USERS, GET_ME } from "../query/user";
import {
  CREATE_USER,
  CreateUserInput,
  UPDATE_USER,
  UpdateUserInput,
} from "../mutation/user";

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

export const useCountUsers = () => {
  const { loading, error, data, refetch } = useQuery(COUNT_USERS);
  return {
    loading,
    error,
    count: data?.countUsers,
    refetch,
  };
};

export const useCreateUser = () => {
  const [createUserMutation, { data, loading, error }] =
    useMutation(CREATE_USER);

  const createUser = async (input: CreateUserInput) => {
    try {
      const response = await createUserMutation({ variables: { input } });
      return response.data?.createUser;
    } catch (err) {
      console.error("Failed to create user:", err);
      throw err;
    }
  };

  return {
    createUser,
    user: data?.createUser,
    loading,
    error,
  };
};

export const useUpdateUser = () => {
  const [updateUserMutation, { data, loading, error }] =
    useMutation(UPDATE_USER);

  const updateUser = async (id: string, input: UpdateUserInput) => {
    try {
      const response = await updateUserMutation({ variables: { id, input } });
      return response.data?.updateUser;
    } catch (err) {
      console.error("Failed to update user:", err);
      throw err;
    }
  };

  return {
    updateUser,
    user: data?.updateUser,
    loading,
    error,
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
