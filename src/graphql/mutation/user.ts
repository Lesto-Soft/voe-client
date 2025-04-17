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

// Define the input type for the mutation
export type AttachmentInput = {
  filename: string;
  file: string; // base64 string
};

export type CreateUserInput = {
  username: string;
  password: string;
  name: string;
  email?: string;
  role?: string; // ID of the role
  // avatar?: AttachmentInput[];
  position?: string;
};

export type UpdateUserInput = {
  username?: string;
  password?: string;
  name?: string;
  email?: string;
  role?: string; // ID of the role
  // avatar?: AttachmentInput[];
  position?: string;
};
