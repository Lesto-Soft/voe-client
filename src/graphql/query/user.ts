import { gql } from "@apollo/client";

const userFragment = `
fragment UserFragment on User {
      _id
      username
      name
      email
      position
      role {
        _id
        name
      }
}`;

export const COUNT_USERS = gql`
  query CountUsers {
    countUsers
  }
`;

export const GET_USERS = gql`
  query GetAllUsers($input: getAllInput) {
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
