// src/graphql/mutation/case.ts (Corrected)
import { gql } from "@apollo/client";

const caseFragment = gql`
  fragment CaseFragmentCreation on Case {
    _id
    content
    type
    priority
    status
    case_number
  }
`;

export const CREATE_CASE = gql`
  mutation CreateCase(
    $creator: ID!
    $content: String!
    $type: CaseType!
    $priority: CasePriority!
    $categories: [ID!]!
    $attachments: [Upload!]
  ) {
    # It then assembles them into the single 'input' object the backend expects
    createCase(
      input: {
        creator: $creator
        content: $content
        type: $type
        priority: $priority
        categories: $categories
        attachments: $attachments
      }
    ) {
      ...CaseFragmentCreation
    }
  }
  ${caseFragment}
`;

export const UPDATE_CASE = gql`
  mutation UpdateCase($caseId: ID!, $userId: ID!, $input: updateCaseInput!) {
    updateCase(caseId: $caseId, userId: $userId, input: $input) {
      _id
    }
  }
`;

export const DELETE_CASE = gql`
  mutation DeleteCase($id: ID!) {
    deleteCase(_id: $id) {
      _id
    }
  }
`;

export const MARK_CASE_AS_READ = gql`
  mutation MarkCaseAsRead($caseId: ID!) {
    markCaseAsRead(caseId: $caseId)
  }
`;
