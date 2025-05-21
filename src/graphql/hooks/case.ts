import { useMutation, useQuery } from "@apollo/client";
import { CREATE_CASE, RATE_CASE } from "../mutation/case";
import {
  COUNT_CASES,
  GET_CASE_BY_CASE_NUMBER,
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

export const useGetCaseByCaseNumber = (caseNumber: number) => {
  const { loading, error, data, refetch } = useQuery(GET_CASE_BY_CASE_NUMBER, {
    variables: { caseNumber },
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

export const useRateCase = () => {
  const [rateCaseMutation, { data, loading, error }] = useMutation(RATE_CASE);

  const rateCase = async (caseId: string, userId: string, score: number) => {
    try {
      const response = await rateCaseMutation({
        variables: { caseId, userId, score },
      });
      return response.data.createRating;
    } catch (err) {
      console.error("Failed to rate case:", err);
      throw err;
    }
  };

  return {
    rateCase,
    data,
    loading,
    error,
  };
};
