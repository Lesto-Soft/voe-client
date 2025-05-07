import { useQuery, useMutation, ApolloError } from "@apollo/client";
import {
  GET_USERS,
  COUNT_USERS,
  GET_ME,
  GET_USER_BY_USERNAME,
  COUNT_USERS_BY_EXACT_EMAIL,
  COUNT_USERS_BY_EXACT_USERNAME,
} from "../query/user"; // Adjust path if needed
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

export const useGetUserByUsername = (username: string) => {
  const { loading, error, data } = useQuery(GET_USER_BY_USERNAME, {
    variables: { username },
  });
  const user = data?.getLeanUserByUsername || null;
  return {
    user,
    loading,
    error,
  };
};

interface CountHookOptions {
  /**
   * If true, the query will be skipped.
   */
  skip?: boolean;
  /**
   * Specifies how the query should interact with the Apollo Client cache.
   * Defaults to 'network-only' for validation to ensure fresh data.
   */
  fetchPolicy?:
    | "cache-first"
    | "network-only"
    | "cache-only"
    | "no-cache"
    | "standby"
    | "cache-and-network";
}

interface CountHookResult {
  /**
   * The number of users found with the exact email. Defaults to 0.
   */
  count: number;
  /**
   * True if the query is currently in flight.
   */
  loading: boolean;
  /**
   * An ApolloError object if the query failed.
   */
  error: ApolloError | undefined;
  /**
   * A function to refetch the query.
   */
  refetch?: (variables?: { email: string }) => Promise<any>; // Typed variables for refetch
}

export const useCountUsersByExactEmail = (
  email: string,
  options?: CountHookOptions
): CountHookResult => {
  // Determine if the query should be skipped:
  // 1. If options.skip is explicitly true.
  // 2. If the email string itself is empty/falsy (no need to query for an empty email).
  const shouldSkipQuery = options?.skip || !email;

  const { loading, error, data, refetch } = useQuery(
    COUNT_USERS_BY_EXACT_EMAIL,
    {
      variables: { email },
      // Pass the calculated skip condition to useQuery
      skip: shouldSkipQuery,
      // Default to 'network-only' for validation to ensure fresh data,
      // but allow override via options.
      fetchPolicy: options?.fetchPolicy || "network-only",
      // Optional: if you want 'loading' to be true during refetches triggered by polling or refetch()
      // notifyOnNetworkStatusChange: true,
    }
  );

  // Ensure 'countUsersByExactEmail' matches the field name in your GQL query response.
  // Default to 0 if data is not yet available or if the field is missing.
  const count = data?.countUsersByExactEmail ?? 0;

  return {
    count,
    loading,
    error,
    refetch,
  };
};

export const useCountUsersByExactUsername = (
  username: string,
  options?: CountHookOptions
): CountHookResult => {
  const shouldSkipQuery = options?.skip || !username;

  const { loading, error, data, refetch } = useQuery(
    COUNT_USERS_BY_EXACT_USERNAME,
    {
      variables: { username },
      skip: shouldSkipQuery,
      fetchPolicy: options?.fetchPolicy || "network-only",
    }
  );

  const count = data?.countUsersByExactUsername ?? 0;

  return {
    count,
    loading,
    error,
    refetch,
  };
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
