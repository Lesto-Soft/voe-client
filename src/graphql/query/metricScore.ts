// src/graphql/query/metricScore.ts
import { gql } from "@apollo/client";

export const GET_CASE_METRIC_SCORES = gql`
  query GetCaseMetricScores($caseId: ID!) {
    getCaseMetricScores(caseId: $caseId) {
      _id
      score
      date
      metric {
        _id
        name
        description
        order
      }
      user {
        _id
        name
      }
    }
  }
`;
