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

export const GET_METRIC_SCORES_BY_METRIC = gql`
  query GetMetricScoresByMetric($metricId: ID!) {
    getMetricScoresByMetric(metricId: $metricId) {
      _id
      score
      date
      user {
        _id
        name
        username
        expert_categories {
          _id
        }
        managed_categories {
          _id
        }
      }
      case {
        _id
        case_number
        creator {
          _id
        }
        categories {
          _id
          experts {
            _id
          }
          managers {
            _id
          }
        }
        readBy {
          user {
            _id
          }
        }
      }
    }
  }
`;
