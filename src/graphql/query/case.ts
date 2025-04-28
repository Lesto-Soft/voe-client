import { gql } from "@apollo/client";

const caseFragment = `
fragment CaseFragment on Case {
      _id
    case_number
    creator {
      _id
      name
    }
    priority
    type
    categories {
        _id
        name
    }
    content
    status  
    date
}`;

export const GET_CASES = gql`
  query GET_CASES($input: getAllInput) {
    getAllCases(input: $input) {
      cases {
        ...CaseFragment
      }
      count
    }
  }
  ${caseFragment}
`;

export const GET_CASES_BY_USER_CATEGORIES = gql`
  query GET_CASES_BY_USER_CATEGORIES($userId: ID!, $input: getAllInput) {
    getCasesByUserCategories(userId: $userId, input: $input) {
      cases {
        ...CaseFragment
      }
      count
    }
  }
  ${caseFragment}
`;

export const GET_USER_CASES = gql`
  query GET_USER_CASES($userId: ID!, $input: getAllInput) {
    getUserCases(userId: $userId, input: $input) {
      cases {
        ...CaseFragment
      }
      count
    }
  }
  ${caseFragment}
`;

export const GET_USER_ANSWERED_CASES = gql`
  query GET_USER_ANSWERED_CASES($userId: ID!, $input: getAllInput) {
    getUserAnsweredCases(userId: $userId, input: $input) {
      cases {
        ...CaseFragment
      }
      count
    }
  }
  ${caseFragment}
`;

export const GET_USER_COMMENTED_CASES = gql`
  query GET_USER_COMMENTED_CASES($userId: ID!, $input: getAllInput) {
    getUserCommentedCases(userId: $userId, input: $input) {
      cases {
        ...CaseFragment
      }
      count
    }
  }
  ${caseFragment}
`;

export const COUNT_CASES = gql`
  query COUNT_CASES {
    countCases
  }
`;
