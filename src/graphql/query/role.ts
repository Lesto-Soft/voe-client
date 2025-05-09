import { gql } from "@apollo/client";

const roleFragment = `
fragment RoleFragment on Role {
      _id
      name
      description
      users {
        _id
      }
}`;

export const GET_ROLES = gql`
  query GetAllRoles {
    getAllLeanRoles {
      ...RoleFragment
    }
  }
  ${roleFragment}
`;
