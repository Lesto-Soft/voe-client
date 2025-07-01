import { useQuery, useMutation } from "@apollo/client";
import { IRatingMetric, IMetricScore } from "../../db/interfaces";

// Import Queries
import { GET_RATING_METRIC_BY_ID } from "../query/ratingMetric";
import { GET_METRIC_SCORES_BY_METRIC } from "../query/metricScore";

// Import Mutations
import { UPDATE_RATING_METRIC } from "../mutation/ratingMetric";

// TS type for the update mutation input
export interface UpdateRatingMetricInput {
  name?: string;
  description?: string;
  archived?: boolean;
}

/**
 * Hook to fetch a single RatingMetric by its ID.
 */
export const useGetRatingMetricById = (metricId: string | undefined) => {
  const { loading, error, data, refetch } = useQuery<{
    getRatingMetricById: IRatingMetric;
  }>(GET_RATING_METRIC_BY_ID, {
    variables: { id: metricId },
    skip: !metricId, // Don't run the query if metricId is not available
  });

  return {
    loading,
    error,
    metric: data?.getRatingMetricById,
    refetch,
  };
};

/**
 * Hook to fetch all IMetricScore objects for a given metricId.
 */
export const useGetMetricScoresByMetric = (metricId: string | undefined) => {
  const { loading, error, data, refetch } = useQuery<{
    getMetricScoresByMetric: IMetricScore[];
  }>(GET_METRIC_SCORES_BY_METRIC, {
    variables: { metricId: metricId },
    skip: !metricId,
  });

  return {
    loading,
    error,
    scores: data?.getMetricScoresByMetric || [],
    refetch,
  };
};

/**
 * Hook to update a RatingMetric.
 */
export const useUpdateRatingMetric = () => {
  const [updateRatingMetricMutation, { loading, error }] =
    useMutation(UPDATE_RATING_METRIC);

  const updateMetric = async (id: string, input: UpdateRatingMetricInput) => {
    try {
      const response = await updateRatingMetricMutation({
        variables: { _id: id, input },
      });
      return response.data?.updateRatingMetric;
    } catch (err) {
      console.error("Failed to update rating metric:", err);
      throw err; // Rethrow to be handled by the calling component
    }
  };

  return { updateMetric, loading, error };
};
