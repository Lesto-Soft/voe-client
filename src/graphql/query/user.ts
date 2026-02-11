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
      last_login
      avatar
      cases {
        _id
        case_number
        content
        date
        status
        type
        priority
        calculatedRating
        creator {
          _id
        }
        categories {
          _id
          name
          color
          experts {
            _id
          }
          managers {
            _id
          }
        }
        answers {
          needs_finance
          approved { _id }
          date
        }
        readBy {
          user {
            _id
          }
        }
        tasks { _id }
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
          date
          priority
          type
          calculatedRating # MODIFIED: Added
          creator {
            _id
          }
          categories {
            _id
            name
            color
          }
          answers {
            needs_finance
            date
            approved {_id}
          }
          readBy {
            user {
              _id
            }
          }
          tasks { _id }
        }
      }
      approvedAnswers {
        _id
        content
        date
        approved_date
        approved {_id}
        case {
          _id
          case_number
          date
          status
          priority
          type
          calculatedRating # MODIFIED: Added
          creator {
            _id
          }
          categories {
            _id
            name
            color
          }
          answers {
            needs_finance
            date
            approved {_id}
          }
          readBy {
            user {
              _id
            }
          }
          tasks { _id }
        }
      }
      financialApprovedAnswers {
        _id
        content
        date
        approved {_id}
        financial_approved_date
        financial_approved {_id}
        case {
          _id
          case_number
          date
          status
          priority
          type
          calculatedRating # MODIFIED: Added
          creator {
            _id
          }
          categories {
            _id
            name
            color
          }
          answers {
            needs_finance
            approved {_id}
            date
          }
          readBy {
            user {
              _id
            }
          }
          tasks { _id }
        }
      }
      comments {
        _id
        content
        date
        case {
          _id
          case_number
          date
          status
          priority
          type
          calculatedRating # MODIFIED: Added
          creator {
            _id
          }
          categories {
            _id
            name
            color
          }
          answers {
            needs_finance
            approved { _id }
            date
          }
          readBy {
            user {
              _id
            }
          }
          tasks { _id }
        }
        answer {
          _id
          approved { _id }
          date
          case {
            _id
            case_number
            status
            priority
            date
            type
            calculatedRating # MODIFIED: Added
            creator {
              _id
            }
            categories {
              _id
              name
              color
            }
            answers {
              needs_finance
              approved { _id }
              date
            }
            readBy {
              user {
                _id
              }
            }
            tasks { _id }
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
      metricScores {
        _id
        score
        date
        metric {
          _id
          name
        }
        case {
          _id
          case_number
          status
          date
          priority
          type
          calculatedRating # MODIFIED: Added
          creator {
            _id
          }
          categories {
            _id
            name
            color
          }
          answers {
            needs_finance
            approved { _id }
            date
          }
          readBy {
            user {
              _id
            }
          }
          tasks { _id }
        }
      }
      assignedTasks {
        _id
        taskNumber
        title
        status
        priority
        dueDate
        createdAt
        completedAt
        creator { _id name username avatar }
        assignee { _id name username avatar }
        relatedCase { _id case_number tasks { _id } }
        canAccessUsers { _id }
      }
      createdTasks {
        _id
        taskNumber
        title
        status
        priority
        dueDate
        createdAt
        completedAt
        creator { _id name username avatar }
        assignee { _id name username avatar }
        relatedCase { _id case_number tasks { _id } }
        canAccessUsers { _id }
      }
      createdTaskActivities {
        _id
        type
        content
        attachments
        createdAt
        updatedAt
        task {
          _id
          taskNumber
          title
          status
          priority
          relatedCase { _id case_number tasks { _id } }
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
      accessibleTasks {
        _id
      }
    }
  }
  ${userFragment}
`;

export const GET_RANKED_USERS = gql`
  query GetRankedUsers($input: RankedUsersInput!) {
    getRankedUsers(input: $input) {
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
      count
    }
  }
`;

export const GET_USER_MENTIONS = gql`
  query getUserMentions($categories: [ID!]!) {
    getExpertsByCategories(categories: $categories) {
      _id
      username
      name
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String, $username: String) {
    requestPasswordReset(email: $email, username: $username) {
      success
      message
    }
  }
`;

export const VERIFY_RESET_TOKEN = gql`
  mutation VerifyResetToken($token: String!) {
    verifyResetToken(token: $token) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;
