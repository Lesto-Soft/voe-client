// src/pages/RatingMetric.tsx
import React, { useState, useMemo } from "react";
import { useParams } from "react-router";
import {
  useGetRatingMetricById,
  useGetMetricScoresByMetric,
  useUpdateRatingMetric,
} from "../graphql/hooks/ratingMetric";
import { useCurrentUser } from "../context/UserContext";
import { IMe, IRatingMetric } from "../db/interfaces";
import { ROLES, TIERS } from "../utils/GLOBAL_PARAMETERS";
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import RatingMetricPageSkeleton from "../components/skeletons/RatingMetricSkeleton";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";
import RatingMetricInformationPanel from "../components/features/ratingMetricAnalytics/RatingMetricInformationPanel";
import MetricScoreList, {
  TierTab,
} from "../components/features/ratingMetricAnalytics/MetricScoreList";
import RatingMetricStatisticsPanel from "../components/features/ratingMetricAnalytics/RatingMetricStatisticsPanel";
import UserModal from "../components/modals/UserModal";
import RatingMetricForm from "../components/forms/RatingMetricForm";
import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";
import { canViewRatingMetric } from "../utils/rightUtils";
import { PieSegmentData } from "../components/charts/PieChart";
// import { XMarkIcon } from "@heroicons/react/24/outline"; // <-- REMOVE THIS IMPORT

// --- REMOVED: FilterTag component definition ---

const RatingMetric: React.FC = () => {
  const { id: metricIdFromParams } = useParams<{ id: string }>();
  const currentUser = useCurrentUser() as IMe;

  // --- State Management ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });
  const [activeTierTab, setActiveTierTab] = useState<TierTab>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // --- GraphQL Hooks ---
  const {
    loading: metricLoading,
    error: metricError,
    metric,
    refetch: refetchMetric,
  } = useGetRatingMetricById(metricIdFromParams);

  const {
    loading: scoresLoading,
    error: scoresError,
    scores,
  } = useGetMetricScoresByMetric(metricIdFromParams);

  const { updateMetric, loading: updateLoading } = useUpdateRatingMetric();

  // --- Authorization & Permissions ---
  const isAllowedToView = canViewRatingMetric(currentUser);
  const canEdit = currentUser?.role?._id === ROLES.ADMIN;

  // --- Handlers ---
  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleFormSubmit = async (formData: Partial<IRatingMetric>) => {
    if (!metric) return;
    try {
      await updateMetric(metric._id, {
        name: formData.name,
        description: formData.description,
        archived: formData.archived,
      });
      await refetchMetric();
      closeEditModal();
      setSuccessModalMessage("Метриката е редактирана успешно!");
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error("Error updating rating metric:", err);
      alert(`Грешка при редактиране: ${err.message}`);
    }
  };

  const handleTierClick = (segment: PieSegmentData) => {
    const tierKey = segment.id as TierTab;
    setActiveTierTab((current) => (current === tierKey ? "all" : tierKey));
    // The line resetting the user is now removed
  };

  const handleUserClick = (segment: PieSegmentData) => {
    const userId = segment.id || null;
    setSelectedUserId((current) => (current === userId ? null : userId));
    // The line resetting the tier tab is now removed
  };
  // --- Filter Logic for passing to MetricScoreList ---
  const isAnyFilterActive = useMemo(
    () =>
      !!(
        dateRange.startDate ||
        dateRange.endDate ||
        activeTierTab !== "all" ||
        selectedUserId !== null
      ),
    [dateRange, activeTierTab, selectedUserId]
  );

  const handleClearAllFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setActiveTierTab("all");
    setSelectedUserId(null);
  };

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    // Find the user object from the scores to get the name
    const scoreWithUser = scores.find((s) => s.user._id === selectedUserId);
    return scoreWithUser ? scoreWithUser.user : null;
  }, [selectedUserId, scores]);

  const tierTabs = useMemo(
    () => [
      { key: "gold", label: `Отлични (>${TIERS.GOLD})` },
      { key: "silver", label: `Добри (${TIERS.SILVER}-${TIERS.GOLD})` },
      { key: "bronze", label: `Средни (${TIERS.BRONZE}-${TIERS.SILVER})` },
      {
        key: "problematic",
        label: `Проблемни (<${TIERS.BRONZE})`,
      },
    ],
    []
  );

  const activeTierLabel =
    tierTabs.find((t) => t.key === activeTierTab)?.label || null;
  const activeUserLabel = selectedUser?.name || null;

  // --- Status Handling ---
  if (!metricIdFromParams)
    return (
      <PageStatusDisplay notFound message="ID на метриката липсва от адреса." />
    );
  if (metricLoading || scoresLoading) {
    return <RatingMetricPageSkeleton />;
  }
  if (metricError || scoresError)
    return <PageStatusDisplay error={metricError || scoresError} />;
  if (!metric)
    return (
      <PageStatusDisplay
        notFound
        message={`Метрика с ID '${metricIdFromParams}' не е намерена.`}
      />
    );
  if (!isAllowedToView) return <ForbiddenPage />;

  return (
    <>
      <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
        {/* --- REMOVED: Active Filters Display Block --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
          <RatingMetricInformationPanel
            metric={metric}
            isLoading={metricLoading}
            onEdit={openEditModal}
            canEdit={canEdit}
          />
          <MetricScoreList
            scores={scores}
            isLoading={scoresLoading}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            activeTierTab={activeTierTab}
            onTabChange={setActiveTierTab}
            selectedUserId={selectedUserId}
            isAnyFilterActive={isAnyFilterActive}
            onClearAllFilters={handleClearAllFilters}
            selectedUserName={selectedUser?.name || null}
            onClearUserFilter={() => setSelectedUserId(null)}
          />
          <RatingMetricStatisticsPanel
            scores={scores}
            isLoading={scoresLoading}
            dateRange={dateRange}
            onTierClick={handleTierClick}
            onUserClick={handleUserClick}
            activeTierLabel={activeTierLabel}
            activeUserLabel={activeUserLabel}
            activeTierFilter={activeTierTab} // <-- ADD THIS
            activeUserFilter={selectedUserId} // <-- AND THIS
          />
        </div>
      </div>

      <UserModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Редактирай метрика за оценка"
      >
        <RatingMetricForm
          onSubmit={handleFormSubmit}
          onClose={closeEditModal}
          initialData={metric}
          isLoading={updateLoading}
        />
      </UserModal>

      <SuccessConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successModalMessage}
      />
    </>
  );
};

export default RatingMetric;
