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
      totalScores
      averageScore
    }
  }
`;

export const GET_RATING_METRIC_BY_ID = gql`
  query GetRatingMetricById($id: ID!) {
    getRatingMetricById(_id: $id) {
      _id
      name
      description
      archived
      order
    }
  }
`;
