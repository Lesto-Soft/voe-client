import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS, COUNT_USERS, GET_ME } from "../query/user"; // Adjust path if needed
import {
  CREATE_USER,
  CreateUserInput,
  UPDATE_USER,
  UpdateUserInput,
} from "../mutation/user"; // Adjust path if needed

// --- Define Input Types (These should match your GraphQL Schema!) ---
// Interface for the filters used in UserManagementPage
interface UserFiltersInput {
  name?: string;
  username?: string;
  position?: string;
  email?: string;
  roleIds?: string[];
  itemsPerPage?: number;
  currentPage?: number; // Expecting the 0-based index here
  query?: string; // Include if your getAllInput still has/needs it
  // Add any other filter fields your backend supports
}

export function buildUserQueryVariables(input: any) {
  const {
    itemsPerPage = 10,
    currentPage = 0,
    query,
    name,
    username,
    position,
    email,
    roleIds,
  } = input || {};

  const variables: any = {
    input: {
      itemsPerPage,
      currentPage,
    },
  };
  if (query) variables.input.query = query;
  if (name) variables.input.name = name;
  if (username) variables.input.username = username;
  if (position) variables.input.position = position;
  if (email) variables.input.email = email;
  if (roleIds && roleIds.length > 0) variables.input.roleIds = roleIds;

  return variables;
}

export const useGetAllUsers = (input: any) => {
  const variables = buildUserQueryVariables(input);

  const { loading, error, data, refetch } = useQuery(GET_USERS, {
    variables,
  });
  const users = data?.getAllUsers || [];
  return {
    users,
    loading,
    error,
    refetch,
  };
};

export const useCountUsers = (input: any) => {
  const variables = buildUserQueryVariables(input);

  const { loading, error, data, refetch } = useQuery(COUNT_USERS, {
    variables,
  });

  const count = data?.countUsers || 0;

  return {
    count,
    loading,
    error,
    refetch,
  };
};

// --- Mutation Hooks (Unchanged) ---

export const useCreateUser = () => {
  const [createUserMutation, { data, loading, error }] =
    useMutation(CREATE_USER);
  // ... (rest of hook is unchanged) ...
  const createUser = async (input: CreateUserInput) => {
    try {
      const response = await createUserMutation({ variables: { input } });
      return response.data?.createUser;
    } catch (err) {
      console.error("Failed to create user:", err);
      throw err;
    }
  };

  return { createUser, user: data?.createUser, loading, error };
};

export const useUpdateUser = () => {
  const [updateUserMutation, { data, loading, error }] =
    useMutation(UPDATE_USER);
  // ... (rest of hook is unchanged) ...
  const updateUser = async (id: string, input: UpdateUserInput) => {
    try {
      const response = await updateUserMutation({ variables: { id, input } });
      return response.data?.updateUser;
    } catch (err) {
      console.error("Failed to update user:", err);
      throw err;
    }
  };

  return { updateUser, user: data?.updateUser, loading, error };
};

// --- useGetMe Hook (Unchanged) ---
export const useGetMe = () => {
  const { loading, error, data, refetch } = useQuery(GET_ME);
  // --- CHECK data access for 'me' ---
  // If GET_ME returns { me: { ... } }, it should be data?.me
  // If it returns { _id: ..., name: ... } directly, then data is correct
  return {
    loading,
    error,
    me: data, // <= CHECK YOUR QUERY RESPONSE FIELD NAME! (Maybe data?.me ?)
    refetch,
  };
};
