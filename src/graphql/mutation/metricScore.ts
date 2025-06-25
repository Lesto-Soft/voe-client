// src/graphql/mutation/metricScore.ts
import { gql } from "@apollo/client";

// TS Type for a single score item in the bulk input
export type MetricScoreItemInput = {
  metric: string; // The ID of the RatingMetric
  score: number;
};

// TS Type for the bulk creation mutation input
export type BulkMetricScoresInput = {
  user: string; // The ID of the User
  case: string; // The ID of the Case
  scores: MetricScoreItemInput[];
};

export const BULK_CREATE_METRIC_SCORES = gql`
  mutation BulkCreateMetricScores($input: bulkMetricScoresInput!) {
    bulkCreateMetricScores(input: $input) {
      _id
      score
      metric {
        _id
        name
      }
    }
  }
`;
