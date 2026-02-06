import React, { useState } from "react";
import { IRiskAssessment, IUser } from "../../../db/interfaces";
import {
  useCreateRiskAssessment,
  useUpdateRiskAssessment,
  useDeleteRiskAssessment,
} from "../../../graphql/hooks/task";
import RiskAssessmentCard from "./RiskAssessmentCard";
import RiskAssessmentModal from "./RiskAssessmentModal";
import RiskMatrix from "./RiskMatrix";
import ConfirmActionDialog from "../../modals/ConfirmActionDialog";
import {
  PlusIcon,
  ShieldCheckIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";

interface RiskAssessmentListProps {
  taskId: string;
  riskAssessments: IRiskAssessment[];
  currentUser: IUser;
  refetch: () => void;
  compact?: boolean;
}

const RiskAssessmentList: React.FC<RiskAssessmentListProps> = ({
  taskId,
  riskAssessments,
  currentUser,
  refetch,
  compact = false,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] =
    useState<IRiskAssessment | null>(null);
  const [deletingAssessment, setDeletingAssessment] =
    useState<IRiskAssessment | null>(null);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  const { createRiskAssessment, loading: createLoading } =
    useCreateRiskAssessment(taskId);
  const { updateRiskAssessment, loading: updateLoading } =
    useUpdateRiskAssessment(taskId);
  const { deleteRiskAssessment, loading: deleteLoading } =
    useDeleteRiskAssessment(taskId);

  // Check if current user already has a Risk Assessment
  const userHasAssessment = riskAssessments.some(
    (ra) => ra.creator._id === currentUser._id
  );

  const canEditAssessment = (assessment: IRiskAssessment) => {
    return (
      currentUser._id === assessment.creator._id ||
      currentUser.role?._id === "ADMIN"
    );
  };

  const handleCreate = async (data: {
    riskDescription: string;
    probability: number;
    impact: number;
    plan: string;
  }) => {
    try {
      await createRiskAssessment({
        task: taskId,
        creator: currentUser._id,
        riskDescription: data.riskDescription,
        probability: data.probability,
        impact: data.impact,
        plan: data.plan,
      });
      refetch();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to create risk assessment:", err);
      throw err;
    }
  };

  const handleUpdate = async (data: {
    riskDescription: string;
    probability: number;
    impact: number;
    plan: string;
  }) => {
    if (!editingAssessment) return;
    try {
      await updateRiskAssessment(editingAssessment._id, {
        riskDescription: data.riskDescription,
        probability: data.probability,
        impact: data.impact,
        plan: data.plan,
      });
      refetch();
      setEditingAssessment(null);
    } catch (err) {
      console.error("Failed to update risk assessment:", err);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingAssessment) return;
    try {
      await deleteRiskAssessment(deletingAssessment._id);
      refetch();
      setDeletingAssessment(null);
    } catch (err) {
      console.error("Failed to delete risk assessment:", err);
    }
  };

  return (
    <div className={compact ? "" : "bg-white rounded-lg shadow-sm"}>
      {/* Header - only show when not in compact mode */}
      {!compact && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
            Оценки на риска ({riskAssessments.length})
          </h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            title="Добави нова оценка"
          >
            <PlusIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className={compact ? "" : "p-4"}>
        {riskAssessments.length > 0 ? (
          <>
            {/* Matrix Button and Add Button */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setIsMatrixOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                <TableCellsIcon className="h-5 w-5" />
                Покажи Матрица на Риска
              </button>
              {/* Add button - only show if current user doesn't have one */}
              {!userHasAssessment && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
                  title="Добави твоя оценка"
                >
                  <PlusIcon className="h-4 w-4" />
                  Добави
                </button>
              )}
            </div>

            {/* Assessment Cards */}
            <div className="space-y-3">
              {riskAssessments.map((assessment) => (
                <RiskAssessmentCard
                  key={assessment._id}
                  assessment={assessment}
                  canEdit={canEditAssessment(assessment)}
                  onEdit={() => setEditingAssessment(assessment)}
                  onDelete={() => setDeletingAssessment(assessment)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className={compact ? "text-center py-4" : "text-center py-6"}>
            <ShieldCheckIcon className={compact ? "h-8 w-8 text-gray-300 mx-auto mb-2" : "h-12 w-12 text-gray-300 mx-auto mb-2"} />
            <p className="text-sm text-gray-500">
              Няма добавени оценки на риска.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <PlusIcon className="h-4 w-4" />
              Добави оценка
            </button>
          </div>
        )}
      </div>

      {/* Risk Matrix Modal */}
      <RiskMatrix
        assessments={riskAssessments}
        isOpen={isMatrixOpen}
        onOpenChange={setIsMatrixOpen}
      />

      {/* Create Modal */}
      <RiskAssessmentModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreate}
        isLoading={createLoading}
      />

      {/* Edit Modal */}
      <RiskAssessmentModal
        isOpen={!!editingAssessment}
        onOpenChange={(open) => !open && setEditingAssessment(null)}
        assessment={editingAssessment || undefined}
        onSubmit={handleUpdate}
        isLoading={updateLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmActionDialog
        isOpen={!!deletingAssessment}
        onOpenChange={(open) => !open && setDeletingAssessment(null)}
        onConfirm={handleDelete}
        title="Изтриване на оценка"
        description={
          <>
            Сигурни ли сте, че искате да изтриете тази оценка на риска?
            <br />
            <span className="text-red-600">Това действие е необратимо.</span>
          </>
        }
        confirmButtonText={deleteLoading ? "Изтриване..." : "Изтрий"}
        cancelButtonText="Отмени"
        isDestructiveAction
      />
    </div>
  );
};

export default RiskAssessmentList;
