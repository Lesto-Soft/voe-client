import { gql } from "@apollo/client";

const categoryFragment = `
fragment CategoryFragment on Category {
      _id
      name
      problem
      suggestion
}`;

export const GET_ACTIVE_CATEGORIES = gql`
  query GetAllActiveCategories {
    getLeanActiveCategories {
      ...CategoryFragment
    }
  }
  ${categoryFragment}
`;
