// src/graphql/query/case.ts (Corrected)
import { gql } from "@apollo/client";

// --- Fragments ---

const metricScoreFragment = gql`
  fragment MetricScoreFragment on MetricScore {
    _id
    score
    date
    metric {
      _id
      name
    }
    user {
      _id
      name
      username
      avatar
    }
  }
`;

const caseFragment = gql`
  fragment CaseFragment on Case {
    _id
    case_number
    creator {
      _id
      name
      position
      username
      expert_categories {
        _id
      }
      managed_categories {
        _id
      }
      avatar
    }
    priority
    type
    categories {
      _id
      name
      experts {
        _id
      }
      managers {
        _id
      }
    }
    content
    status
    date
    attachments
    answers {
      needs_finance
    }
    readBy {
      user {
        _id
      }
    }
  }
`;

const caseHistoryFragment = gql`
  fragment CaseHistoryFragment on CaseHistory {
    _id
    date_change
    user {
      name
      username
      _id
      expert_categories {
        _id
      }
      managed_categories {
        _id
      }
    }
    old_type
    new_type
    old_priority
    new_priority
    old_content
    new_content
    new_categories {
      _id
      name
      experts {
        _id
      }
      managers {
        _id
      }
    }
    old_categories {
      _id
      name
      experts {
        _id
      }
      managers {
        _id
      }
    }
  }
`;

const answerFragment = gql`
  fragment AnswerFragment on Answer {
    _id
    content
    date
    attachments
    creator {
      _id
      name
      username
      position
      expert_categories {
        _id
      }
      managed_categories {
        _id
      }
    }
    approved {
      _id
      name
      username
      expert_categories {
        _id
      }
      managed_categories {
        _id
      }
    }
    approved_date
    financial_approved {
      _id
      name
      username
      expert_categories {
        _id
      }
      managed_categories {
        _id
      }
    }
    financial_approved_date
    needs_finance
    history {
      _id
      new_content
      old_content
      date_change
      user {
        _id
        username
        name
        expert_categories {
          _id
        }
        managed_categories {
          _id
        }
      }
    }
  }
`;

const commentFragment = gql`
  fragment CommentFragment on Comment {
    _id
    creator {
      username
      name
      position
      _id
      expert_categories {
        _id
      }
      managed_categories {
        _id
      }
    }
    content
    date
    attachments
  }
`;

// --- Queries ---

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

export const GET_RELEVANT_CASES = gql`
  query GET_RELEVANT_CASES($input: getAllInput, $userId: ID!) {
    getRelevantCases(input: $input, userId: $userId) {
      cases {
        ...CaseFragment
      }
      count
    }
  }
  ${caseFragment}
`;

export const GET_ANALYTITCS_DATA_CASES = gql`
  query GET_ANALYTITCS_DATA_CASES {
    getAnalyticsDataCases {
      ...CaseFragment
      calculatedRating
      answers {
        _id
        approved {
          _id
          name
          username
          avatar
          expert_categories {
            _id
          }
          managed_categories {
            _id
          }
        }
        creator {
          _id
          name
          username
          avatar
          expert_categories {
            _id
          }
          managed_categories {
            _id
          }
        }
      }
      metricScores {
        ...MetricScoreFragment
      }
    }
  }
  ${caseFragment}
  ${metricScoreFragment}
`;

export const GET_CASE_BY_CASE_NUMBER = gql`
  query GET_CASE_BY_CASE_NUMBER($caseNumber: Int!, $roleId: String) {
    getCaseByNumber(case_number: $caseNumber, roleId: $roleId) {
      # REMOVED: ...CaseFragment

      # ADDED: All required top-level fields from the fragment
      _id
      case_number
      content
      date
      type
      attachments
      priority
      status

      # Fields that were already explicitly defined
      calculatedRating
      creator {
        _id
        name
        position
        username
        avatar
        expert_categories {
          _id
        }
        managed_categories {
          _id
        }
      }
      categories {
        _id
        name
        experts {
          _id
          name
          username
        }
        managers {
          _id
          name
          username
        }
      }
      metricScores {
        ...MetricScoreFragment
      }
      comments {
        ...CommentFragment
      }
      history {
        ...CaseHistoryFragment
      }
      answers {
        creator {
          avatar
        }
        ...AnswerFragment
        comments {
          ...CommentFragment
        }
      }
      # The full, detailed readBy field we need for the modal
      readBy {
        user {
          _id
          name
          username
          avatar
          expert_categories {
            _id
          }
          managed_categories {
            _id
          }
        }
        date
      }
    }
  }
  ${metricScoreFragment}
  ${caseHistoryFragment}
  ${answerFragment}
  ${commentFragment}
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

export const GET_CASES_BY_USER_MANAGED_CATEGORIES = gql`
  query GET_CASES_BY_USER_MANAGED_CATEGORIES(
    $userId: ID!
    $input: getAllInput
  ) {
    getCasesByUserManagedCategories(userId: $userId, input: $input) {
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

export const COUNT_FILTERED_CASES = gql`
  query CountFilteredCases($input: getAllInput) {
    countFilteredCases(input: $input)
  }
`;
