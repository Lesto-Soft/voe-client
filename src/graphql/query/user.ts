import { gql } from "@apollo/client";

const userFragment = `
fragment UserFragment on User {
      _id
      username
      name
      email
      position
      financial_approver
      role {
        _id
        name
      }
      avatar
      cases {_id}
      answers {_id}
      comments {_id}
      expert_categories {_id}
      managed_categories {_id}
     
}`;

// we do so many populates since in UserActivityItemCard we need to get case.creator._id, case.categories._id, and case.answers.needs_finance
// for each case, answers.case, comment.case, and comment.answers.case and yeah
// we do this to get the proper CaseLink authorization
const fullUserFragment = `
fragment FullUserFragment on User {
      _id
      username
      name
      email
      position
      financial_approver
      role {
        _id
        name
      }
      avatar
      cases {
        _id
        case_number
        content
        date
        status
        type
        priority
        creator {
          _id
        }
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
        answers {
          needs_finance
        }
      }
      answers {
        _id
        content
        date
        approved {
          _id
        }
        needs_finance
        financial_approved {
          _id
        }
        case {
          _id
          case_number
          status
          creator {
            _id
          }
          categories {
            _id
            name
          }
          answers {
            needs_finance
          }
        }
      }
      comments {
        _id
        content
        date
        case {
          _id
          case_number
          status
          creator {
            _id
          }
          categories {
            _id
            name
          }
          answers {
            needs_finance
          }
        }
        answer {
          _id
          case {
            _id
            case_number
            status
            creator {
              _id
            }
            categories {
              _id
              name
            }
            answers {
              needs_finance
            }
          }
        }
      }
      expert_categories {
        _id
        name
        experts {
          _id
        }
        managers {
          _id
        }
      }
      managed_categories {
        _id
        name
        experts {
          _id
        }
        managers {
          _id
        }
      }
}`;

export const COUNT_USERS = gql`
  query CountUsers($input: getUserFiltersInput) {
    countUsers(input: $input)
  }
`;

export const GET_USERS = gql`
  query GetAllUsers($input: getUserFiltersInput) {
    getAllUsers(input: $input) {
      ...UserFragment
      avatar
    }
  }
  ${userFragment}
`;

export const GET_FULL_USER_BY_USERNAME = gql`
  query GetFullUserByUsername($username: String!) {
    getFullUserByUsername(username: $username) {
      ...FullUserFragment
    }
  }
  ${fullUserFragment}
`;

export const GET_USER_BY_ID = gql`
  query GetUserByID($_id: ID!) {
    getUserById(_id: $_id) {
      ...FullUserFragment
    }
  }
  ${fullUserFragment}
`;

export const GET_USER_BY_USERNAME = gql`
  query GetUserByUsername($username: String!) {
    getLeanUserByUsername(username: $username) {
      _id
      name
    }
  }
`;

export const COUNT_USERS_BY_EXACT_USERNAME = gql`
  query CountUsersByExactUsername($username: String!) {
    countUsersByExactUsername(username: $username)
  }
`;

export const COUNT_USERS_BY_EXACT_EMAIL = gql`
  query CountUsersByExactEmail($email: String!) {
    countUsersByExactEmail(email: $email)
  }
`;

export const GET_LEAN_USERS = gql`
  query GetLeanUsers($input: String) {
    getLeanUsers(input: $input) {
      _id
      name
      username
      role {
        _id
      }
      managed_categories {
        _id
      }
      expert_categories {
        _id
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      ...UserFragment
      avatar
      managed_categories {
        _id
      }
      expert_categories {
        _id
      }
      answers {
        _id
      }
      comments {
        _id
      }
    }
  }
  ${userFragment}
`;
