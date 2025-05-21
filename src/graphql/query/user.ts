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
