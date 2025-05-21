import { gql } from "@apollo/client";

// Make sure this fragment requests fields needed immediately after creation,
// OR ensure the fragment definition here matches any used elsewhere if necessary.
// The minimal fragment below is likely okay, but confirm.
const caseFragment = `
fragment CaseFragment on Case {
  _id # Often useful to get the ID back
  content
  type
  priority
  status # Added status as it's set automatically
  case_number # Added case_number as it's set automatically
  # Add other fields if your UI needs them immediately after creation
}`;

export const CREATE_CASE = gql`
  mutation CreateCase($input: createCaseInput!) {
    # <-- CORRECTED: lowercase 'c'
    createCase(input: $input) {
      ...CaseFragment
    }
  }
  ${caseFragment}
`;

export const RATE_CASE = gql`
  mutation Mutation($caseId: ID!, $userId: ID!, $score: Int!) {
    createRating(caseId: $caseId, userId: $userId, score: $score) {
      _id
    }
  }
`;
