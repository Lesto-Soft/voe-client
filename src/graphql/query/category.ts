import { gql } from "@apollo/client";

const categoryFragment = `
fragment CategoryFragment on Category {
      _id
      name
      problem
      suggestion
}`;

export const GET_CATEGORIES = gql`
  query GetAllCategories($input: getAllInput) {
    getAllCategories(input: $input) {
      ...CategoryFragment
    }
  }
  ${categoryFragment}
`;
