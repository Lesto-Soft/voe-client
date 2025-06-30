// src/graphql/mutation/ratingMetric.ts
import { gql } from "@apollo/client";

const RATING_METRIC_FRAGMENT = gql`
  fragment RatingMetricFragment on RatingMetric {
    _id
    name
    description
    order
    archived
    totalScores
    averageScore
  }
`;

export const CREATE_RATING_METRIC = gql`
  mutation CreateRatingMetric($input: createRatingMetricInput!) {
    createRatingMetric(input: $input) {
      ...RatingMetricFragment
    }
  }
  ${RATING_METRIC_FRAGMENT}
`;

export const UPDATE_RATING_METRIC = gql`
  mutation UpdateRatingMetric($_id: ID!, $input: updateRatingMetricInput!) {
    updateRatingMetric(_id: $_id, input: $input) {
      ...RatingMetricFragment
    }
  }
  ${RATING_METRIC_FRAGMENT}
`;

export const DELETE_RATING_METRIC = gql`
  mutation DeleteRatingMetric($id: ID!) {
    deleteRatingMetric(_id: $id) {
      ...RatingMetricFragment
    }
  }
  ${RATING_METRIC_FRAGMENT}
`;

export const REORDER_RATING_METRICS = gql`
  mutation ReorderRatingMetrics($orderedIds: [ID!]!) {
    reorderRatingMetrics(orderedIds: $orderedIds)
  }
`;
