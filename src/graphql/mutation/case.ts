// src/graphql/mutation/case.ts (Corrected)
import { gql } from "@apollo/client";

const caseFragment = gql`
  fragment CaseFragment on Case {
    _id
    content
    type
    priority
    status
    case_number
  }
`;

export const CREATE_CASE = gql`
  mutation CreateCase($input: createCaseInput!) {
    createCase(input: $input) {
      ...CaseFragment
    }
  }
  ${caseFragment}
`;

// <-- ADDED BACK
export const UPDATE_CASE = gql`
  mutation UpdateCase($caseId: ID!, $userId: ID!, $input: updateCaseInput!) {
    updateCase(caseId: $caseId, userId: $userId, input: $input) {
      _id
    }
  }
`;
