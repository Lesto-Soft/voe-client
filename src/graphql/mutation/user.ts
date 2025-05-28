import { gql } from "@apollo/client";

// Fragment for User fields needed immediately after creation
const userFragment = `
  fragment MutationUserFragment on User {
    _id
    username
    name
    email
    avatar
    position
    financial_approver
  }
`;

// GraphQL Mutation for creating a user
export const CREATE_USER = gql`
  mutation CreateUser($input: createUserInput!) {
    createUser(input: $input) {
      ...MutationUserFragment
    }
  }
  ${userFragment}
`;

// GraphQL Mutation for updating a user
export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: updateUserInput!) {
    updateUser(_id: $id, input: $input) {
      ...MutationUserFragment
    }
  }
  ${userFragment}
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(_id: $id) {
      ...MutationUserFragment
    }
  }
  ${userFragment}
`;

// Define the input type for the mutation
export type AttachmentInput = {
  filename: string;
  file: string; // base64 string
};

export type CreateUserInput = {
  username: string;
  password: string;
  name: string;
  email?: string | null; // Allow null
  role?: string | null; // ID of the role, allow null
  avatar?: AttachmentInput | null; // Optional avatar input
  position?: string | null; // Allow null
  financial_approver?: boolean;
};

export type UpdateUserInput = {
  username?: string;
  password?: string; // Optional password change
  name?: string;
  email?: string | null; // Allow null
  role?: string | null; // ID of the role, allow null
  avatar?: AttachmentInput | null | undefined; //  Can be object, null (remove), or undefined
  position?: string | null; // Allow null
  financial_approver?: boolean;
};
