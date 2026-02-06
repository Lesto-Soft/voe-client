import React, { useState } from "react";
import { IFiveWhy, IWhyStep, IUser } from "../../../db/interfaces";
import {
  useCreateFiveWhy,
  useUpdateFiveWhy,
  useDeleteFiveWhy,
} from "../../../graphql/hooks/task";
import FiveWhyDisplay from "./FiveWhyDisplay";
import FiveWhyModal from "./FiveWhyModal";
import ConfirmActionDialog from "../../modals/ConfirmActionDialog";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

interface FiveWhyListProps {
  taskId: string;
  fiveWhys: IFiveWhy[];
  currentUser: IUser;
  refetch: () => void;
  compact?: boolean;
}

const FiveWhyList: React.FC<FiveWhyListProps> = ({
  taskId,
  fiveWhys,
  currentUser,
  refetch,
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(
    fiveWhys.length > 0 ? fiveWhys[0]._id : null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFiveWhy, setEditingFiveWhy] = useState<IFiveWhy | null>(null);
  const [deletingFiveWhy, setDeletingFiveWhy] = useState<IFiveWhy | null>(null);

  const { createFiveWhy, loading: createLoading } = useCreateFiveWhy(taskId);
  const { updateFiveWhy, loading: updateLoading } = useUpdateFiveWhy(taskId);
  const { deleteFiveWhy, loading: deleteLoading } = useDeleteFiveWhy(taskId);

  const activeFiveWhy = fiveWhys.find((fw) => fw._id === activeTab);

  // Check if current user already has a Five Why analysis
  const userHasFiveWhy = fiveWhys.some(
    (fw) => fw.creator._id === currentUser._id
  );

  const canEditFiveWhy = (fiveWhy: IFiveWhy) => {
    return (
      currentUser._id === fiveWhy.creator._id ||
      currentUser.role?._id === "ADMIN"
    );
  };

  const handleCreate = async (data: {
    whys: IWhyStep[];
    rootCause: string;
    counterMeasures: string;
  }) => {
    try {
      await createFiveWhy({
        task: taskId,
        creator: currentUser._id,
        whys: data.whys,
        rootCause: data.rootCause,
        counterMeasures: data.counterMeasures,
      });
      refetch();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to create Five Why:", err);
      throw err;
    }
  };

  const handleUpdate = async (data: {
    whys: IWhyStep[];
    rootCause: string;
    counterMeasures: string;
  }) => {
    if (!editingFiveWhy) return;
    try {
      await updateFiveWhy(editingFiveWhy._id, {
        whys: data.whys,
        rootCause: data.rootCause,
        counterMeasures: data.counterMeasures,
      });
      refetch();
      setEditingFiveWhy(null);
    } catch (err) {
      console.error("Failed to update Five Why:", err);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingFiveWhy) return;
    try {
      await deleteFiveWhy(deletingFiveWhy._id);
      refetch();
      setDeletingFiveWhy(null);
      // Switch to first remaining tab or null
      const remaining = fiveWhys.filter((fw) => fw._id !== deletingFiveWhy._id);
      setActiveTab(remaining.length > 0 ? remaining[0]._id : null);
    } catch (err) {
      console.error("Failed to delete Five Why:", err);
    }
  };

  // Update activeTab when fiveWhys changes
  React.useEffect(() => {
    if (fiveWhys.length > 0 && !fiveWhys.find((fw) => fw._id === activeTab)) {
      setActiveTab(fiveWhys[0]._id);
    } else if (fiveWhys.length === 0) {
      setActiveTab(null);
    }
  }, [fiveWhys, activeTab]);

  return (
    <div className={compact ? "" : "bg-white rounded-lg shadow-sm"}>
      {/* Header - only show when not in compact mode */}
      {!compact && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <QuestionMarkCircleIcon className="h-5 w-5 text-amber-500" />
            5 Защо Анализи ({fiveWhys.length})
          </h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            title="Добави нов анализ"
          >
            <PlusIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      )}

      {fiveWhys.length > 0 ? (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-4 overflow-x-auto">
            {fiveWhys.map((fiveWhy) => (
              <button
                key={fiveWhy._id}
                onClick={() => setActiveTab(fiveWhy._id)}
                className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                  activeTab === fiveWhy._id
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
              >
                {fiveWhy.creator.name.split(" ")[0]}
              </button>
            ))}
            {/* Add button - only show if current user doesn't have one */}
            {!userHasFiveWhy && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-2 py-2 text-xs font-medium border-b-2 -mb-px border-transparent text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer flex items-center gap-1"
                title="Добави твоя анализ"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Добави
              </button>
            )}
          </div>

          {/* Content */}
          {activeFiveWhy && (
            <div className="p-4">
              <FiveWhyDisplay fiveWhy={activeFiveWhy} />

              {/* Actions */}
              {canEditFiveWhy(activeFiveWhy) && (
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setEditingFiveWhy(activeFiveWhy)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    Редактирай
                  </button>
                  <button
                    onClick={() => setDeletingFiveWhy(activeFiveWhy)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Изтрий
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className={compact ? "py-4 text-center" : "p-6 text-center"}>
          <QuestionMarkCircleIcon className={compact ? "h-8 w-8 text-gray-300 mx-auto mb-2" : "h-12 w-12 text-gray-300 mx-auto mb-2"} />
          <p className="text-sm text-gray-500">Няма добавени анализи.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <PlusIcon className="h-4 w-4" />
            Добави анализ
          </button>
        </div>
      )}

      {/* Create Modal */}
      <FiveWhyModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreate}
        isLoading={createLoading}
      />

      {/* Edit Modal */}
      <FiveWhyModal
        isOpen={!!editingFiveWhy}
        onOpenChange={(open) => !open && setEditingFiveWhy(null)}
        fiveWhy={editingFiveWhy || undefined}
        onSubmit={handleUpdate}
        isLoading={updateLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmActionDialog
        isOpen={!!deletingFiveWhy}
        onOpenChange={(open) => !open && setDeletingFiveWhy(null)}
        onConfirm={handleDelete}
        title="Изтриване на анализ"
        description={
          <>
            Сигурни ли сте, че искате да изтриете този „5 Защо" анализ?
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

export default FiveWhyList;
