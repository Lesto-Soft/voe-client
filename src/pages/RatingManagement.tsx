// src/pages/RatingManagement.tsx
import React, { useMemo, useState } from "react";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
import { useGetAllRatingMetrics } from "../graphql/hooks/rating";
import { useRatingMetricManagement } from "../hooks/useRatingMetricManagement";
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import RatingMetricFilters from "../components/features/ratingManagement/RatingMetricFilters";
import { IRatingMetric } from "../db/interfaces";
import RatingMetricTable from "../components/features/ratingManagement/RatingMetricTable";

const RatingManagement: React.FC = () => {
  const {
    filterName,
    setFilterName,
    debouncedFilterName,
    filterDescription,
    setFilterDescription,
    debouncedFilterDescription,
    archivedStatus,
    setArchivedStatus,
  } = useRatingMetricManagement();

  // Determine if we need to include archived metrics in the initial fetch
  // We fetch ALL (active + archived) if the user wants to see "all" or "archived"
  const includeArchivedInQuery = archivedStatus !== "active";

  const {
    ratingMetrics,
    loading: metricsLoading,
    error: metricsError,
  } = useGetAllRatingMetrics({
    variables: { includeArchived: includeArchivedInQuery },
    fetchPolicy: "cache-and-network",
  });

  // This logic now handles both text filtering and status filtering on the client side
  const filteredMetrics = useMemo(() => {
    if (!ratingMetrics) return [];

    return ratingMetrics
      .filter((metric: IRatingMetric) => {
        // Apply status filter first
        if (archivedStatus === "active") return !metric.archived;
        if (archivedStatus === "archived") return metric.archived;
        return true; // "all"
      })
      .filter((metric: IRatingMetric) => {
        // Then apply text filters
        const nameMatch = debouncedFilterName
          ? metric.name
              .toLowerCase()
              .includes(debouncedFilterName.toLowerCase())
          : true;
        const descriptionMatch = debouncedFilterDescription
          ? metric.description
              .toLowerCase()
              .includes(debouncedFilterDescription.toLowerCase())
          : true;
        return nameMatch && descriptionMatch;
      });
  }, [
    ratingMetrics,
    debouncedFilterName,
    debouncedFilterDescription,
    archivedStatus,
  ]);

  const handleEditMetric = (metric: IRatingMetric) => {
    alert(`Editing: ${metric.name}`);
  };

  const handleDeleteMetric = (metric: IRatingMetric) => {
    alert(`Deleting: ${metric.name}`);
  };

  if (metricsError) {
    return <PageStatusDisplay error={metricsError} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Управление на метрики за оценка
        </h1>
        <div className="flex-shrink-0">
          <button className="flex w-full justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 active:bg-green-700">
            <PlusIconSolid className="h-5 w-5 mr-1" />
            Създай метрика
          </button>
        </div>
      </div>

      <div className="mb-6">
        <RatingMetricFilters
          filterName={filterName}
          setFilterName={setFilterName}
          filterDescription={filterDescription}
          setFilterDescription={setFilterDescription}
          archivedStatus={archivedStatus}
          setArchivedStatus={setArchivedStatus}
        />
      </div>

      <RatingMetricTable
        isLoading={metricsLoading && !ratingMetrics.length}
        metrics={filteredMetrics}
        onEditMetric={handleEditMetric}
        onDeleteMetric={handleDeleteMetric}
      />
    </div>
  );
};

export default RatingManagement;
