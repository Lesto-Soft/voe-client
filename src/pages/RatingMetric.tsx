import React, { useState } from "react";
import { useParams } from "react-router";
import {
  useGetRatingMetricById,
  useGetMetricScoresByMetric,
  useUpdateRatingMetric,
} from "../graphql/hooks/ratingMetric";
import { useCurrentUser } from "../context/UserContext";
import { IMe, IRatingMetric } from "../db/interfaces";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";

// UI Components
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";
import RatingMetricInformationPanel from "../components/features/ratingMetricAnalytics/RatingMetricInformationPanel";
import MetricScoreList from "../components/features/ratingMetricAnalytics/MetricScoreList";
import RatingMetricStatisticsPanel from "../components/features/ratingMetricAnalytics/RatingMetricStatisticsPanel";
import UserModal from "../components/modals/UserModal";
import RatingMetricForm from "../components/forms/RatingMetricForm";
import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";

// Auth
import { canViewRatingMetric } from "../utils/rightUtils";

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
      // A simple alert for now; this can be enhanced to show the error in the form itself.
      alert(`Грешка при редактиране: ${err.message}`);
    }
  };

  // --- Status Handling ---
  if (!metricIdFromParams)
    return (
      <PageStatusDisplay notFound message="ID на метриката липсва от адреса." />
    );
  if (metricLoading || scoresLoading)
    return (
      <PageStatusDisplay loading message="Зареждане на данни за метриката..." />
    );
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
          />
          <RatingMetricStatisticsPanel
            scores={scores}
            isLoading={scoresLoading}
            dateRange={dateRange}
          />
        </div>
      </div>

      {/* Edit Modal that displays the form */}
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

      {/* Success Confirmation Modal */}
      <SuccessConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successModalMessage}
      />
    </>
  );
};

export default RatingMetric;
