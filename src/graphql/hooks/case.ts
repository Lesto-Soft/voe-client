import { useMutation, useQuery, QueryHookOptions } from "@apollo/client";
import { CREATE_CASE } from "../mutation/case";
import {
  COUNT_CASES,
  COUNT_FILTERED_CASES,
  GET_CASES,
  GET_CASES_BY_USER_CATEGORIES,
  GET_USER_ANSWERED_CASES,
  GET_USER_CASES,
  GET_USER_COMMENTED_CASES,
} from "../query/case";

export type AttachmentInput = {
  filename: string;
  file: string; // base64 string
};

export type CreateCaseInput = {
  content: string;
  type: "PROBLEM" | "SUGGESTION";
  priority: "LOW" | "MEDIUM" | "HIGH";
  attachments?: AttachmentInput[];
  categories: string[];
  creator: string;
};

// Define a more specific type for the data returned by the query
interface CountFilteredCasesData {
  countFilteredCases: number;
}

// Define a more specific type for the variables expected by the query
// Replace 'any' with the actual structure of your 'getAllInput' if defined
interface CountFilteredCasesVariables {
  input: any;
}

// Reusable function to build variables for case queries
export function buildCaseQueryVariables(input: any) {
  const {
    itemsPerPage = 10,
    currentPage = 0,
    query,
    type,
    priority,
    creatorId,
    categories,
    status,
    case_number,
  } = input || {};

  const variables: any = {
    input: {
      itemsPerPage,
      currentPage,
    },
  };
  if (query) variables.input.query = query;
  if (case_number) variables.input.case_number = case_number;
  if (priority) variables.input.priority = priority;
  if (type) variables.input.type = type;
  if (creatorId) variables.input.creatorId = creatorId;
  if (categories && categories.length > 0)
    variables.input.categories = categories;
  if (status) variables.input.status = status;

  return variables;
}

export const useGetAllCases = (input: any) => {
  const variables = buildCaseQueryVariables(input);

  const { loading, error, data, refetch } = useQuery(GET_CASES, {
    variables,
  });
  const cases = data?.getAllCases.cases || [];
  const count = data?.getAllCases.count || 0;
  return {
    cases,
    count,
    loading,
    error,
    refetch,
  };
};

export const useGetCasesByUserCategories = (userId: string, input: any) => {
  const variables = {
    userId,
    ...buildCaseQueryVariables(input),
  };
  const { loading, error, data, refetch } = useQuery(
    GET_CASES_BY_USER_CATEGORIES,
    {
      variables,
    }
  );

  const cases = data?.getCasesByUserCategories.cases || [];
  const count = data?.getCasesByUserCategories.count || 0;
  return {
    cases,
    count,
    loading,
    error,
    refetch,
  };
};

export const useUserCases = (userId: string, input: any) => {
  const variables = {
    userId,
    ...buildCaseQueryVariables(input),
  };
  const { loading, error, data, refetch } = useQuery(GET_USER_CASES, {
    variables,
  });

  const cases = data?.getUserCases.cases || [];
  const count = data?.getUserCases.count || 0;
  return {
    cases,
    count,
    loading,
    error,
    refetch,
  };
};

export const useUserAnsweredCases = (userId: string, input: any) => {
  const variables = {
    userId,
    ...buildCaseQueryVariables(input),
  };
  const { loading, error, data, refetch } = useQuery(GET_USER_ANSWERED_CASES, {
    variables,
  });

  const cases = data?.getUserAnsweredCases.cases || [];
  const count = data?.getUserAnsweredCases.count || 0;
  return {
    cases,
    count,
    loading,
    error,
    refetch,
  };
};

export const useUserCommentedCases = (userId: string, input: any) => {
  const variables = {
    userId,
    ...buildCaseQueryVariables(input),
  };
  const { loading, error, data, refetch } = useQuery(GET_USER_COMMENTED_CASES, {
    variables,
  });

  const cases = data?.getUserCommentedCases.cases || [];
  const count = data?.getUserCommentedCases.count || 0;
  return {
    cases,
    count,
    loading,
    error,
    refetch,
  };
};
export const useCreateCase = () => {
  const [createCaseMutation, { data, loading, error }] =
    useMutation(CREATE_CASE);

  const createCase = async (input: CreateCaseInput) => {
    try {
      const response = await createCaseMutation({ variables: { input } });
      return response.data.createCase;
    } catch (err) {
      console.error("Failed to create case:", err);
      throw err;
    }
  };

  return {
    createCase,
    data,
    loading,
    error,
  };
};

export const useCountCases = () => {
  const { loading, error, data } = useQuery(COUNT_CASES);
  const count = data?.countCases || 0;

  return {
    count,
    loading,
    error,
  };
};

export const useCountFilteredCases = (
  // The first argument is your custom object used to build the actual GraphQL variables
  inputForVariables: any,
  // The second argument (optional) is for Apollo's standard QueryHookOptions
  options?: QueryHookOptions<
    CountFilteredCasesData,
    CountFilteredCasesVariables
  >
) => {
  // Build the GraphQL variables using your utility function
  const gqlVariables = buildCaseQueryVariables(inputForVariables);

  const { loading, error, data, refetch } = useQuery<
    CountFilteredCasesData,
    CountFilteredCasesVariables
  >(
    COUNT_FILTERED_CASES, // Your GraphQL query document
    {
      variables: gqlVariables, // Pass the built variables
      ...options, // Spread any additional Apollo options (like skip, onCompleted, etc.)
    }
  );

  // Default count to 0 if data or countFilteredCases is not available
  const count = data?.countFilteredCases ?? 0;

  return {
    count,
    loading,
    error,
    refetch,
  };
};
