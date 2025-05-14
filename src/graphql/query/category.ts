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
      managers {
        _id
        name
      }
      cases {
        _id
        status
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

export const COUNT_CATEGORIES_BY_EXACT_NAME = gql`
  query CountCategoriesByExactName($name: String!) {
    countCategoriesByExactName(name: $name)
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
