// src/pages/RatingManagement.tsx
import React, { useMemo, useState, useEffect } from "react";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline"; // <-- Import chevrons
import {
  useGetAllRatingMetrics,
  useCreateRatingMetric,
  useUpdateRatingMetric,
  useDeleteRatingMetric,
  useReorderRatingMetrics,
} from "../graphql/hooks/rating";
import { useRatingMetricManagement } from "../hooks/useRatingMetricManagement";
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import RatingMetricFilters from "../components/features/ratingManagement/RatingMetricFilters";
import { IMe, IRatingMetric } from "../db/interfaces";
import RatingMetricTable from "../components/features/ratingManagement/RatingMetricTable";
import UserModal from "../components/modals/UserModal";
import RatingMetricForm from "../components/forms/RatingMetricForm";
import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";
import ConfirmActionDialog from "../components/modals/ConfirmActionDialog";
import { useCurrentUser } from "../context/UserContext";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";

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

  const [displayMetrics, setDisplayMetrics] = useState<IRatingMetric[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<IRatingMetric | null>(
    null
  );
  const [metricToDelete, setMetricToDelete] = useState<IRatingMetric | null>(
    null
  );
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [showFilters, setShowFilters] = useState(true); // <-- State for filters toggle

  const {
    ratingMetrics: fetchedMetrics,
    loading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useGetAllRatingMetrics({
    variables: { includeArchived: archivedStatus !== "active" },
    fetchPolicy: "cache-and-network",
  });

  const { createRatingMetric, loading: createLoading } =
    useCreateRatingMetric();
  const { updateRatingMetric, loading: updateLoading } =
    useUpdateRatingMetric();
  const { deleteRatingMetric, loading: deleteLoading } =
    useDeleteRatingMetric();
  const { reorderRatingMetrics, loading: reorderLoading } =
    useReorderRatingMetrics();

  const currentUser = useCurrentUser() as IMe | undefined;
  const isAdmin = currentUser?.role?._id === ROLES.ADMIN;

  const isMutating =
    createLoading || updateLoading || deleteLoading || reorderLoading;

  const filteredMetrics = useMemo(() => {
    if (!fetchedMetrics) return [];
    return fetchedMetrics
      .filter((metric: IRatingMetric) => {
        if (archivedStatus === "active") return !metric.archived;
        if (archivedStatus === "archived") return metric.archived;
        return true;
      })
      .filter((metric: IRatingMetric) => {
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
    fetchedMetrics,
    debouncedFilterName,
    debouncedFilterDescription,
    archivedStatus,
  ]);

  useEffect(() => {
    if (JSON.stringify(displayMetrics) !== JSON.stringify(filteredMetrics)) {
      setDisplayMetrics(filteredMetrics);
    }
  }, [filteredMetrics]);

  const handleOpenCreateModal = () => {
    setEditingMetric(null);
    setIsFormModalOpen(true);
  };

  const handleEditMetric = (metric: IRatingMetric) => {
    setEditingMetric(metric);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingMetric(null);
  };

  const handleFormSubmit = async (formData: Partial<IRatingMetric>) => {
    const { name, description, archived } = formData;
    const input = { name, description, archived };

    try {
      let successMessage = "";
      if (editingMetric) {
        await updateRatingMetric({
          variables: { _id: editingMetric._id, input },
        });
        successMessage = "Метриката е редактирана успешно!";
      } else {
        await createRatingMetric({ variables: { input } });
        successMessage = "Метриката е създадена успешно!";
      }

      await refetchMetrics();
      handleCloseModal();
      setSuccessModalMessage(successMessage);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error("Failed to save rating metric:", err);
      alert(`Грешка при запис: ${err.message}`);
    }
  };

  const handleDeleteMetric = (metric: IRatingMetric) => {
    setMetricToDelete(metric);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!metricToDelete) return;
    try {
      await deleteRatingMetric({ variables: { id: metricToDelete._id } });
      setSuccessModalMessage(
        `Метриката "${metricToDelete.name}" е изтрита успешно.`
      );
      setIsSuccessModalOpen(true);
      await refetchMetrics();
    } catch (err: any) {
      console.error("Failed to delete metric:", err);
      alert(`Грешка при изтриване: ${err.message}`);
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setMetricToDelete(null);
    }
  };

  const handleReorderSave = async (orderedIds: string[]) => {
    try {
      await reorderRatingMetrics({ variables: { orderedIds } });
      await refetchMetrics();
    } catch (err: any) {
      console.error("Failed to reorder metrics:", err);
      setDisplayMetrics(filteredMetrics);
      alert("Грешка при пренареждането.");
    }
  };

  if (metricsError) {
    return <PageStatusDisplay error={metricsError} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* --- PAGE HEADER SECTION --- */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-end gap-4">
        {/* NEW: Buttons container */}
        <div className="flex flex-col sm:flex-row gap-2 items-center md:items-start flex-shrink-0">
          <button
            className="w-full sm:w-auto flex justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-gray-500 text-white hover:bg-gray-600 hover:cursor-pointer"
            title={showFilters ? "Скрий филтри" : "Покажи филтри"}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <ChevronUpIcon className="h-5 w-5 mr-1" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 mr-1" />
            )}
            Филтри
          </button>
          {/* --- Conditionally render the create button --- */}
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-[280px] flex flex-shrink-0 justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 active:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isMutating}
            >
              <PlusIconSolid className="h-5 w-5 mr-1" />
              Създай метрика
            </button>
          )}
        </div>
      </div>

      {/* --- FILTERS SECTION --- */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showFilters ? "max-h-screen opacity-100 mb-6" : "max-h-0 opacity-0"
        }`}
      >
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
        isLoading={metricsLoading && !fetchedMetrics?.length}
        metrics={displayMetrics}
        setMetrics={setDisplayMetrics}
        onEditMetric={handleEditMetric}
        onDeleteMetric={handleDeleteMetric}
        onReorderSave={handleReorderSave}
        isAdmin={isAdmin}
      />

      {/* --- Conditionally render the form modal --- */}
      {isAdmin && (
        <UserModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModal}
          title={editingMetric ? "Редактирай метрика" : "Създай нова метрика"}
        >
          <RatingMetricForm
            key={editingMetric ? editingMetric._id : "create-new-metric"}
            onSubmit={handleFormSubmit}
            onClose={handleCloseModal}
            initialData={editingMetric}
            isLoading={isMutating}
          />
        </UserModal>
      )}

      {isAdmin && (
        <ConfirmActionDialog
          isOpen={isConfirmDeleteDialogOpen}
          onOpenChange={setIsConfirmDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="Потвърди изтриването"
          description={
            <span>
              Сигурни ли сте, че искате да изтриете метриката
              <strong className="px-1">{metricToDelete?.name}</strong>? Всички
              оценки, дадени за нея, също ще бъдат изтрити. Тази операция е
              необратима.
            </span>
          }
          confirmButtonText="Изтрий"
          isDestructiveAction={true}
        />
      )}

      <SuccessConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successModalMessage}
      />
    </div>
  );
};

export default RatingManagement;
