import { gql } from "@apollo/client";

const categoryFragment = `
fragment CategoryFragment on Category {
      _id
      name
      problem
      suggestion
      experts {
        _id
        name
      }
      cases {
        _id
      }
      archived
}`;

export const GET_ALL_LEAN_CATEGORIES = gql`
  query GetAllLeanCategories($input: getCategoryFiltersInput) {
    getAllLeanCategories(input: $input) {
      ...CategoryFragment
    }
  }
  ${categoryFragment}
`;

export const COUNT_CATEGORIES = gql`
  query CountCategories($input: getCategoryFiltersInput) {
    countCategories(input: $input)
  }
`;

export const GET_ACTIVE_CATEGORIES = gql`
  query GetAllActiveCategories {
    getLeanActiveCategories {
      ...CategoryFragment
    }
  }
  ${categoryFragment}
`;
