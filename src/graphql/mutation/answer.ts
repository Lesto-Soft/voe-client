import { gql } from "@apollo/client";

export const APPROVE_ANSWER = gql`
  mutation ApproveAnswer($answerId: ID!, $userId: ID!, $needsFinance: Boolean) {
    approveAnswer(
      answerId: $answerId
      userId: $userId
      needs_finance: $needsFinance
    ) {
      _id
    }
  }
`;

export const UNAPPROVE_ANSWER = gql`
  mutation UnapproveAnswer($answerId: ID!) {
    unapproveAnswer(answerId: $answerId) {
      _id
    }
  }
`;

export const APPROVE_ANSWER_FINANCE = gql`
  mutation ApproveFinanceAnswer($answerId: ID!, $userId: ID!) {
    approveFinanceAnswer(answerId: $answerId, userId: $userId) {
      _id
    }
  }
`;

export const UNAPPROVE_ANSWER_FINANCE = gql`
  mutation UnapproveFinanceAnswer($answerId: ID!) {
    unapproveFinanceAnswer(answerId: $answerId) {
      _id
    }
  }
`;
