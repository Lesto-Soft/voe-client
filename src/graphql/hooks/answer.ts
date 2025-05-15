import { useMutation, useQuery } from "@apollo/client";
import {
  APPROVE_ANSWER,
  APPROVE_ANSWER_FINANCE,
  UNAPPROVE_ANSWER,
  UNAPPROVE_ANSWER_FINANCE,
} from "../mutation/answer";

export const useApproveAnswer = () => {
  const [approveAnswerMutation, { data, loading, error }] =
    useMutation(APPROVE_ANSWER);

  const approveAnswer = async (
    answerId: string,
    userId: string,
    needsFinance: boolean
  ) => {
    try {
      const response = await approveAnswerMutation({
        variables: { answerId, userId, needsFinance },
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

  const unapproveAnswer = async (answerId: string) => {
    console.log("Unapproving answer:", answerId);
    try {
      const response = await unapproveAnswerMutation({
        variables: { answerId },
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

  const approveFinanceAnswer = async (answerId: string, userId: string) => {
    try {
      const response = await approveFinanceAnswerMutation({
        variables: { answerId, userId },
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

  const unapproveFinanceAnswer = async (answerId: string) => {
    try {
      const response = await unapproveFinanceAnswerMutation({
        variables: { answerId },
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
