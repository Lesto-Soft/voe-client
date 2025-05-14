import { gql } from "@apollo/client";

// Fragment for User fields needed immediately after creation
const categoryFragment = `
  fragment MutationCategoryFragment on Category {
    _id
    name
    archived
    problem
    suggestion
    experts{_id}
    managers{_id}
  }
`;

// GraphQL Mutation for creating a category
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: createCategoryInput!) {
    createCategory(input: $input) {
      ...MutationCategoryFragment
    }
  }
  ${categoryFragment}
`;

// GraphQL Mutation for updating a category
export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: updateCategoryInput!) {
    updateCategory(_id: $id, input: $input) {
      ...MutationCategoryFragment
    }
  }
  ${categoryFragment}
`;

export type CreateCategoryInput = {
  name: string;
  problem?: string;
  suggestion?: string;
  experts?: string[];
  managers?: string[];
  archived?: boolean;
};

export type UpdateCategoryInput = {
  name?: string;
  problem?: string;
  suggestion?: string;
  experts?: string[];
  managers?: string[];
  archived?: boolean;
};
