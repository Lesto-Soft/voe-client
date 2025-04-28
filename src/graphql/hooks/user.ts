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
  // Add any other filter fields your backend supports
}

// Interface for the options object passed to useGetUsers
interface GetUsersOptions {
  filters?: UserFiltersInput;
  limit?: number;
  offset?: number; // Use offset for flexibility
}

// --- Modified useGetUsers Hook ---
export const useGetUsers = (options?: GetUsersOptions) => {
  const itemsPerPage = options?.limit ?? 10; // Default limit if not provided
  const offset = options?.offset ?? 0; // Default offset if not provided
  // Calculate currentPage based on offset and limit (backend might prefer offset directly)
  const currentPage = itemsPerPage > 0 ? Math.floor(offset / itemsPerPage) : 0;

  // Prepare variables matching the *expected* structure of the GET_USERS query input
  // --- IMPORTANT ---
  // This assumes your GET_USERS GraphQL query expects an 'input' argument,
  // and you will modify that 'input' type on the backend to include 'filters'.
  const variables: { input: any } = {
    // Use 'any' for input temporarily, define a proper type later
    input: {
      itemsPerPage: itemsPerPage,
      currentPage: currentPage, // Pass calculated page, OR modify backend to accept offset
      // query: "", // Remove the old generic query string? Or pass filters differently?
      // Add filters nested within input - ADJUST THIS based on backend changes!
      filters: options?.filters,
    },
  };

  // If no filters are present, remove the filters key to avoid sending empty objects?
  // (Depends on backend requirements)
  if (!options?.filters || Object.keys(options.filters).length === 0) {
    delete variables.input.filters;
  }

  const { loading, error, data, refetch } = useQuery(GET_USERS, {
    variables: variables,
    fetchPolicy: "cache-and-network", // Example fetch policy
  });

  return {
    loading,
    error,
    // --- ADJUST data access based on your GQL Query response ---
    // Common patterns: data?.getAllUsers, data?.users
    users: data?.getAllUsers, // <= CHECK YOUR QUERY RESPONSE FIELD NAME!
    refetch,
    data, // Expose raw data
  };
};

// --- Modified useCountUsers Hook ---
// Define options type
interface CountUsersOptions {
  filters?: UserFiltersInput;
}

export const useCountUsers = (options?: CountUsersOptions) => {
  // Prepare variables based on how COUNT_USERS query expects filters
  // --- IMPORTANT ---
  // This assumes your COUNT_USERS query will be updated on the backend
  // to accept a 'filters' argument. Adjust structure if needed (e.g., { input: { filters: ... } })
  const variables: CountUsersOptions = {};
  if (options?.filters && Object.keys(options.filters).length > 0) {
    variables.filters = options.filters;
  }

  const { loading, error, data, refetch } = useQuery(COUNT_USERS, {
    // Pass variables only if filters exist, or always pass empty obj if required
    variables: Object.keys(variables).length > 0 ? variables : undefined,
    fetchPolicy: "cache-and-network", // Ensure it refetches when filters change
  });

  return {
    loading,
    error,
    // Data access seems correct based on original hook
    count: data?.countUsers,
    refetch,
    data, // Expose raw data
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
