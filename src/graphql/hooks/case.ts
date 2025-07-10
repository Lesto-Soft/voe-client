// src/graphql/hooks/case.ts (Corrected)
import { useMutation, useQuery, QueryHookOptions } from "@apollo/client";
import { CREATE_CASE, DELETE_CASE, UPDATE_CASE } from "../mutation/case"; // RATE_CASE removed from imports
import {
  COUNT_CASES,
  COUNT_FILTERED_CASES,
  GET_ANALYTITCS_DATA_CASES,
  GET_CASE_BY_CASE_NUMBER,
  GET_CASES,
  GET_CASES_BY_USER_CATEGORIES,
  GET_CASES_BY_USER_MANAGED_CATEGORIES,
  GET_RELEVANT_CASES,
  GET_USER_ANSWERED_CASES,
  GET_USER_CASES,
  GET_USER_COMMENTED_CASES,
  // UPDATE_CASE, // This was duplicated, removed.
} from "../query/case";
import moment from "moment";

export type AttachmentInput = {
  filename: string;
  file: string; // base64 string
};

export type CreateCaseInput = {
  content: string;
  type: "PROBLEM" | "SUGGESTION";
  priority: "LOW" | "MEDIUM" | "HIGH";
  attachments?: File[];
  categories: string[];
  creator: string;
};

export type UpdateCaseInput = {
  content: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  type: "PROBLEM" | "SUGGESTION";
  categories: string[];
  attachments?: File[];
  deletedAttachments?: string[];
};

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
    startDate,
    endDate,
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
  if (startDate) variables.input.startDate = startDate;
  if (endDate) variables.input.endDate = endDate;

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

export const useGetRelevantCases = (userId: string, input: any) => {
  const variables = buildCaseQueryVariables(input);

  const { loading, error, data, refetch } = useQuery(GET_RELEVANT_CASES, {
    variables: {
      ...variables,
      userId,
    },
    skip: !userId,
  });
  const cases = data?.getRelevantCases.cases || [];
  const count = data?.getRelevantCases.count || 0;

  return {
    cases,
    count,
    loading,
    error,
    refetch,
  };
};

export const useGetAnalyticsDataCases = () => {
  const { loading, error, data } = useQuery(GET_ANALYTITCS_DATA_CASES);
  const cases = data?.getAnalyticsDataCases || 0;

  return {
    cases,
    loading,
    error,
  };
};

export const useGetCaseByCaseNumber = (caseNumber: number, roleId: string) => {
  const { loading, error, data, refetch } = useQuery(GET_CASE_BY_CASE_NUMBER, {
    variables: { caseNumber, roleId },
  });
  const caseData = data?.getCaseByNumber || null;
  return {
    caseData,
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

export const useGetCasesByUserManagedCategories = (
  userId: string,
  input: any
) => {
  const variables = {
    userId,
    ...buildCaseQueryVariables(input),
  };
  const { loading, error, data, refetch } = useQuery(
    GET_CASES_BY_USER_MANAGED_CATEGORIES,
    {
      variables,
    }
  );

  const cases = data?.getCasesByUserManagedCategories.cases || [];
  const count = data?.getCasesByUserManagedCategories.count || 0;
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

  const count = data?.getUserCases.count || 0;
  const cases = data?.getUserCases.cases || [];
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
      const response = await createCaseMutation({
        variables: input,
      });
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

// The 'useRateCase' hook has been removed as it is now obsolete.

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

  const count = data?.countFilteredCases ?? 0;

  return {
    count,
    loading,
    error,
    refetch,
  };
};

export const useUpdateCase = (caseNumber: number) => {
  const [updateCaseMutation, { data, loading, error }] = useMutation(
    UPDATE_CASE,
    {
      refetchQueries: [
        { query: GET_CASE_BY_CASE_NUMBER, variables: { caseNumber } },
      ],
      awaitRefetchQueries: true,
    }
  );

  const updateCase = async (
    caseId: string,
    userId: string,
    input: UpdateCaseInput
  ) => {
    try {
      const response = await updateCaseMutation({
        variables: { caseId, userId, input },
      });
      return response.data.updateCase;
    } catch (err) {
      console.error("Failed to update case:", err);
      throw err;
    }
  };

  return {
    updateCase,
    data,
    loading,
    error,
  };
};

export const useDeleteCase = (
  options: {
    onCompleted?: () => void;
  } = {}
) => {
  const [deleteCaseMutation, { data, loading, error }] = useMutation(
    DELETE_CASE,
    {
      onCompleted: options.onCompleted,
    }
  );

  const deleteCase = async (id: string) => {
    try {
      const response = await deleteCaseMutation({
        variables: { id },
      });
      return response.data.deleteCase;
    } catch (err) {
      console.error("Failed to delete case:", err);
      throw err;
    }
  };

  return {
    deleteCase,
    data,
    loading,
    error,
  };
};
