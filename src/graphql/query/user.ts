import { gql } from "@apollo/client";

const userFragment = `
fragment UserFragment on User {
      _id
      name
      email
      position
      role {
        name
      }
}`;

export const GET_USERS = gql`
  query GetAllUsers($input: getAllInput) {
    getAllUsers(input: $input) {
      ...UserFragment
      avatar
    }
  }
  ${userFragment}
`;
