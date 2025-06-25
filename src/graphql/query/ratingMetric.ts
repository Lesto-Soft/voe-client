// src/graphql/query/ratingMetric.ts
import { gql } from "@apollo/client";

export const GET_ALL_RATING_METRICS = gql`
  query GetAllRatingMetrics($includeArchived: Boolean) {
    getAllRatingMetrics(includeArchived: $includeArchived) {
      _id
      name
      description
      order
      archived
    }
  }
`;
