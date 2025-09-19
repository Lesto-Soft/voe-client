import { useEffect } from "react";
import { useQuery, useMutation, ApolloError } from "@apollo/client";
import {
  GET_USERS,
  COUNT_USERS,
  GET_ME,
  GET_USER_BY_USERNAME,
  COUNT_USERS_BY_EXACT_EMAIL,
  COUNT_USERS_BY_EXACT_USERNAME,
  GET_USER_BY_ID,
  GET_FULL_USER_BY_USERNAME,
  GET_RANKED_USERS,
  GET_USER_MENTIONS,
} from "../query/user"; // Adjust path if needed
import {
  CREATE_USER,
  CreateUserInput,
  UPDATE_USER,
  UpdateUserInput,
  DELETE_USER,
} from "../mutation/user"; // Adjust path if needed
import { IUser } from "../../db/interfaces";
import {
  RankedUser,
  RankingType,
} from "../../components/features/analyses/types";

export function buildUserQueryVariables(input: any) {
  const {
    itemsPerPage,
    currentPage,
    query,
    name,
    username,
    position,
    email,
    roleIds,
    financial_approver,
    is_manager, // <-- Destructure is_manager
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
  if (financial_approver)
    variables.input.financial_approver = financial_approver;
  if (is_manager === true) {
    variables.input.is_manager = true;
  }

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

export const useGetFullUserByUsername = (username: string | undefined) => {
  const { loading, error, data, refetch } = useQuery<{
    getFullUserByUsername: IUser;
  }>(GET_FULL_USER_BY_USERNAME, {
    variables: { username: username },
    skip: !username, // Skip the query if username is undefined or null
  });

  useEffect(() => {
    if (!loading) {
      if (error) {
        console.error("[HOOK] Error:", JSON.stringify(error, null, 2)); // Stringify for more detail
      }
    }
  }, [loading, data, error, refetch]);

  return {
    loading,
    error,
    user: data?.getFullUserByUsername,
    refetch,
  };
};

export const useGetUserById = (id: string | undefined) => {
  const { loading, error, data } = useQuery<{ getUserById: IUser }>(
    GET_USER_BY_ID,
    {
      variables: { _id: id },
      skip: !id, // Skip the query if id is undefined or null
    }
  );

  // For debugging the hook's output
  useEffect(() => {
    if (!loading) {
      if (error) {
        console.error("[HOOK] Error:", JSON.stringify(error, null, 2)); // Stringify for more detail
      }
    }
  }, [loading, data, error]);

  return {
    loading,
    error,
    user: data?.getUserById,
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

export const useDeleteUser = () => {
  const [deleteUserMutation, { data, loading, error }] =
    useMutation(DELETE_USER);
  const deleteUser = async (id: string) => {
    try {
      const response = await deleteUserMutation({ variables: { id } });
      return response.data?.deleteUser;
    } catch (err) {
      console.error("Failed to delete user:", err);
      throw err;
    }
  };

  return { deleteUser, user: data?.deleteUser, loading, error };
};

export const useGetUserByUsername = (username: string) => {
  const { loading, error, data } = useQuery(GET_USER_BY_USERNAME, {
    variables: { username },
    skip: !username,
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

export const useGetMe = () => {
  const { loading, error, data, refetch } = useQuery(GET_ME);

  return {
    loading,
    error,
    me: data,
    refetch,
  };
};

/**
 * Fetches a ranked list of users from the new server-side aggregation query.
 * @param startDate - The start of the period.
 * @param endDate - The end of the period.
 * @param type - The type of ranking to fetch.
 * @param isAllTime - If true, startDate and endDate are ignored.
 */
export const useGetRankedUsers = (
  startDate: Date | null,
  endDate: Date | null,
  type: RankingType,
  isAllTime: boolean
) => {
  const { data, loading, error } = useQuery<{ getRankedUsers: RankedUser[] }>(
    GET_RANKED_USERS,
    {
      variables: {
        input: {
          startDate: isAllTime ? null : startDate?.toISOString(),
          endDate: isAllTime ? null : endDate?.toISOString(),
          type,
        },
      },
      // Skip the query if a date range is required but not yet available
      skip: !isAllTime && (!startDate || !endDate),
    }
  );

  return {
    rankedUsers: data?.getRankedUsers || [],
    loading,
    error,
  };
};

export const useGetUserMentions = (categories: string[]) => {
  const { data, loading, error } = useQuery(GET_USER_MENTIONS, {
    variables: { categories },
    skip: categories.length === 0,
  });

  return {
    userMentions: data?.getExpertsByCategories || [],
    loading,
    error,
  };
};
