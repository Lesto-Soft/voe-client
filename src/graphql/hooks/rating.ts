// src/graphql/hooks/rating.ts
import { useQuery, useMutation, QueryHookOptions } from "@apollo/client";
import { useMemo } from "react";
import { IRatingMetric, IMetricScore } from "../../db/interfaces";

import { GET_ALL_RATING_METRICS } from "../query/ratingMetric";
import {
  CREATE_RATING_METRIC,
  UPDATE_RATING_METRIC,
  DELETE_RATING_METRIC,
  REORDER_RATING_METRICS,
} from "../mutation/ratingMetric";

import { GET_CASE_METRIC_SCORES } from "../query/metricScore";
import {
  BULK_CREATE_METRIC_SCORES,
  BulkMetricScoresInput,
  DELETE_METRIC_SCORE,
} from "../mutation/metricScore";

// =================================================================
// RATING METRIC HOOKS
// =================================================================

export const useGetAllRatingMetrics = (
  options?: QueryHookOptions<{ getAllRatingMetrics: IRatingMetric[] }>
) => {
  const { loading, error, data, refetch } = useQuery(
    GET_ALL_RATING_METRICS,
    options
  );
  return {
    ratingMetrics: data?.getAllRatingMetrics || [],
    loading,
    error,
    refetch,
  };
};

export const useCreateRatingMetric = () => {
  const [createRatingMetric, { loading, error }] =
    useMutation(CREATE_RATING_METRIC);
  return { createRatingMetric, loading, error };
};

export const useUpdateRatingMetric = () => {
  const [updateRatingMetric, { loading, error }] =
    useMutation(UPDATE_RATING_METRIC);
  return { updateRatingMetric, loading, error };
};

export const useDeleteRatingMetric = () => {
  const [deleteRatingMetric, { loading, error }] =
    useMutation(DELETE_RATING_METRIC);
  return { deleteRatingMetric, loading, error };
};

export const useReorderRatingMetrics = () => {
  const [reorderRatingMetrics, { loading, error }] = useMutation(
    REORDER_RATING_METRICS
  );
  return { reorderRatingMetrics, loading, error };
};

// =================================================================
// METRIC SCORE HOOKS
// =================================================================

export const useGetCaseMetricScores = (caseId: string) => {
  const { loading, error, data, refetch } = useQuery(GET_CASE_METRIC_SCORES, {
    variables: { caseId },
    skip: !caseId,
  });

  // --- THIS IS THE FIX ---
  // useMemo ensures that we don't create a new array instance on every render
  // unless the actual data from the query has changed.
  const metricScores = useMemo(
    () => (data?.getCaseMetricScores || []) as IMetricScore[],
    [data]
  );

  return {
    metricScores, // Return the memoized, stable value
    loading,
    error,
    refetch,
  };
};

export const useBulkCreateMetricScores = () => {
  const [bulkCreateMetricScores, { loading, error, data }] = useMutation<{
    bulkCreateMetricScores: IMetricScore[];
  }>(BULK_CREATE_METRIC_SCORES);

  const submitScores = async (input: BulkMetricScoresInput) => {
    try {
      const response = await bulkCreateMetricScores({ variables: { input } });
      return response.data?.bulkCreateMetricScores;
    } catch (err) {
      console.error("Failed to submit scores:", err);
      throw err;
    }
  };

  return {
    submitScores,
    loading,
    error,
    data,
  };
};

export const useDeleteMetricScore = () => {
  const [deleteMetricScoreMutation, { loading, error }] =
    useMutation(DELETE_METRIC_SCORE);

  const deleteScore = async (_id: string) => {
    try {
      await deleteMetricScoreMutation({ variables: { _id } });
    } catch (err) {
      console.error("Failed to delete metric score:", err);
      throw err;
    }
  };

  return { deleteScore, loading, error };
};
