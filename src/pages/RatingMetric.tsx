import React, { useState } from "react";
import { useParams } from "react-router";
import {
  useGetRatingMetricById,
  useGetMetricScoresByMetric,
} from "../graphql/hooks/ratingMetric";
import { useCurrentUser } from "../context/UserContext";
import { IMe } from "../db/interfaces";

// UI Components
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import ForbiddenPage from "./ForbiddenPage";

// Auth
import { canViewRatingMetric } from "../utils/rightUtils";

const RatingMetric: React.FC = () => {
  const { id: metricIdFromParams } = useParams<{ id: string }>();
  const currentUser = useCurrentUser() as IMe;

  // --- State for date filtering (will be used in a later step) ---
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  // --- GraphQL Hooks ---
  const {
    loading: metricLoading,
    error: metricError,
    metric,
  } = useGetRatingMetricById(metricIdFromParams);

  const {
    loading: scoresLoading,
    error: scoresError,
    scores,
  } = useGetMetricScoresByMetric(metricIdFromParams);

  // --- Authorization ---
  const isAllowed = canViewRatingMetric(currentUser);

  // --- Status Handling ---
  if (!metricIdFromParams) {
    return (
      <PageStatusDisplay notFound message="ID на метриката липсва от адреса." />
    );
  }

  // Handle loading state for both queries
  if (metricLoading || scoresLoading) {
    return (
      <PageStatusDisplay loading message="Зареждане на данни за метриката..." />
    );
  }

  // Handle error state for both queries
  if (metricError || scoresError) {
    return <PageStatusDisplay error={metricError || scoresError} />;
  }

  // Handle metric not found
  if (!metric) {
    return (
      <PageStatusDisplay
        notFound
        message={`Метрика с ID '${metricIdFromParams}' не е намерена.`}
      />
    );
  }

  // Handle forbidden access
  if (!isAllowed) {
    return <ForbiddenPage />;
  }

  // --- Main Render ---
  return (
    <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Placeholder for Column 1: Information Panel */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-4">
          <h2 className="font-bold text-lg">
            RatingMetricInformationPanel (Placeholder)
          </h2>
          <pre className="text-xs bg-gray-100 p-2 mt-2 rounded">
            {JSON.stringify(metric, null, 2)}
          </pre>
        </div>

        {/* Placeholder for Column 2: Scores List */}
        <div className="lg:col-span-6 bg-white rounded-lg shadow-lg p-4">
          <h2 className="font-bold text-lg">MetricScoreList (Placeholder)</h2>
          <p className="mt-2">Total scores fetched: {scores.length}</p>
        </div>

        {/* Placeholder for Column 3: Statistics Panel */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-4">
          <h2 className="font-bold text-lg">
            RatingMetricStatisticsPanel (Placeholder)
          </h2>
          <p className="mt-2">Pie charts will go here.</p>
        </div>
      </div>
    </div>
  );
};

export default RatingMetric;
