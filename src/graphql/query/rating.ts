// graphql/query/rating.ts
import { gql } from "@apollo/client";
export const GET_ACTIVE_RATING_METRICS = gql`
  query GetActiveRatingMetrics {
    getActiveRatingMetrics {
      _id
      name
      description
      tiers {
        tier1
        tier2
        tier3
      }
      order
    }
  }
`;

export const GET_CASE_RATINGS = gql`
  query GetCaseRatings($caseId: ID!) {
    getRatingsByCase(caseId: $caseId) {
      _id
      user {
        _id
        name
      }
      overallScore
      scores {
        metric {
          _id
          name
        }
        score
      }
    }
  }
`;
