import { useMutation, useQuery } from "@apollo/client";
import {
  APPROVE_ANSWER,
  APPROVE_ANSWER_FINANCE,
  CREATE_ANSWER,
  DELETE_ANSWER,
  UNAPPROVE_ANSWER,
  UNAPPROVE_ANSWER_FINANCE,
  UPDATE_ANSWER,
} from "../mutation/answer";
import { GET_CASE_BY_CASE_NUMBER, GET_CASE_ANSWERS } from "../query/case";

/**
 * Fetches all answers for a given case.
 * Useful for populating task descriptions from case answers.
 */
export const useGetCaseAnswers = (caseId?: string) => {
  const { loading, error, data, refetch } = useQuery(GET_CASE_ANSWERS, {
    variables: { caseId },
    skip: !caseId,
  });

  const answers = data?.getCaseAnswers || [];

  return {
    answers,
    loading,
    error,
    refetch,
  };
};

export const useApproveAnswer = () => {
  const [approveAnswerMutation, { data, loading, error }] =
    useMutation(APPROVE_ANSWER);

  const approveAnswer = async (
    answerId: string,
    userId: string,
    needsFinance: boolean,
    caseNumber: number
  ) => {
    try {
      const response = await approveAnswerMutation({
        variables: { answerId, userId, needsFinance },
        refetchQueries: [
          { query: GET_CASE_BY_CASE_NUMBER, variables: { caseNumber } },
        ],
        awaitRefetchQueries: true,
      });
      return response.data.approveAnswer;
    } catch (err) {
      console.error("Failed to approve:", err);
      throw err;
    }
  };

  return {
    approveAnswer,
    data,
    loading,
    error,
  };
};

export const useUnapproveAnswer = () => {
  const [unapproveAnswerMutation, { data, loading, error }] =
    useMutation(UNAPPROVE_ANSWER);

  const unapproveAnswer = async (answerId: string, caseNumber: number) => {
    try {
      const response = await unapproveAnswerMutation({
        variables: { answerId },
        refetchQueries: [
          { query: GET_CASE_BY_CASE_NUMBER, variables: { caseNumber } },
        ],
        awaitRefetchQueries: true,
      });
      return response.data.unapproveAnswer;
    } catch (err) {
      console.error("Failed to unapprove answer:", err);
      throw err;
    }
  };

  return {
    unapproveAnswer,
    data,
    loading,
    error,
  };
};

export const useApproveFinanceAnswer = () => {
  const [approveFinanceAnswerMutation, { data, loading, error }] = useMutation(
    APPROVE_ANSWER_FINANCE
  );

  const approveFinanceAnswer = async (
    answerId: string,
    userId: string,
    caseNumber: number
  ) => {
    try {
      const response = await approveFinanceAnswerMutation({
        variables: { answerId, userId },
        refetchQueries: [
          { query: GET_CASE_BY_CASE_NUMBER, variables: { caseNumber } },
        ],
        awaitRefetchQueries: true,
      });
      return response.data.approveFinanceAnswer;
    } catch (err) {
      console.error("Failed to approve finance:", err);
      throw err;
    }
  };

  return {
    approveFinanceAnswer,
    data,
    loading,
    error,
  };
};

export const useUnapproveFinanceAnswer = () => {
  const [unapproveFinanceAnswerMutation, { data, loading, error }] =
    useMutation(UNAPPROVE_ANSWER_FINANCE);

  const unapproveFinanceAnswer = async (
    answerId: string,
    caseNumber: number
  ) => {
    try {
      const response = await unapproveFinanceAnswerMutation({
        variables: { answerId },
        refetchQueries: [
          { query: GET_CASE_BY_CASE_NUMBER, variables: { caseNumber } },
        ],
        awaitRefetchQueries: true,
      });
      return response.data.unapproveFinanceAnswer;
    } catch (err) {
      console.error("Failed to unapprove finance:", err);
      throw err;
    }
  };

  return {
    unapproveFinanceAnswer,
    data,
    loading,
    error,
  };
};

export const useCreateAnswer = (caseNumber: number) => {
  const [createAnswerMutation, { data, loading, error }] = useMutation(
    CREATE_ANSWER,
    {
      refetchQueries: [
        { query: GET_CASE_BY_CASE_NUMBER, variables: { caseNumber } },
      ],
      awaitRefetchQueries: true,
    }
  );

  const createAnswer = async (input: any) => {
    try {
      const response = await createAnswerMutation({
        variables: input,
      });
      return response.data.createAnswer;
    } catch (err) {
      console.error("Failed to create answer:", err);
      throw err;
    }
  };

  return {
    createAnswer,
    data,
    loading,
    error,
  };
};

export const useUpdateAnswer = (caseNumber: number) => {
  const [updateAnswerMutation, { data, loading, error }] = useMutation(
    UPDATE_ANSWER,
    {
      refetchQueries: [
        { query: GET_CASE_BY_CASE_NUMBER, variables: { caseNumber } },
      ],
      awaitRefetchQueries: true,
    }
  );

  const updateAnswer = async (input: any, answerId: string, userId: string) => {
    try {
      const response = await updateAnswerMutation({
        variables: { input: { ...input }, userId, answerId },
      });
      return response.data.updateAnswer;
    } catch (err) {
      console.error("Failed to update answer:", err);
      throw err;
    }
  };

  return {
    updateAnswer,
    data,
    loading,
    error,
  };
};

export const useDeleteAnswer = (caseNumber: number) => {
  const [deleteAnswerMutation, { data, loading, error }] = useMutation(
    DELETE_ANSWER,
    {
      refetchQueries: [
        { query: GET_CASE_BY_CASE_NUMBER, variables: { caseNumber } },
      ],
      awaitRefetchQueries: true,
    }
  );

  const deleteAnswer = async (answerId: string) => {
    try {
      const response = await deleteAnswerMutation({
        variables: { deleteAnswerId: answerId },
      });
      return response.data.deleteAnswer;
    } catch (err) {
      console.error("Failed to delete answer:", err);
      throw err;
    }
  };

  return {
    deleteAnswer,
    data,
    loading,
    error,
  };
};
