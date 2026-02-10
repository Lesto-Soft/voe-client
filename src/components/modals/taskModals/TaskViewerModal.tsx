// src/components/modals/taskModals/TaskViewerModal.tsx
import React, { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useGetAllTasks, TaskFiltersInput } from "../../../graphql/hooks/task";
import { TaskStatus, CasePriority } from "../../../db/interfaces";
import { TaskList } from "../../task";

export type TaskModalFilters = {
  status?: TaskStatus;
  priority?: CasePriority;
  startDate?: Date | null;
  endDate?: Date | null;
};

interface TaskViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters: TaskModalFilters;
  title: string;
}

const ITEMS_PER_PAGE = 12;

const TaskViewerModal: React.FC<TaskViewerModalProps> = ({
  isOpen,
  onClose,
  initialFilters,
  title,
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  const queryInput: TaskFiltersInput = useMemo(() => {
    const input: TaskFiltersInput = {
      itemsPerPage: ITEMS_PER_PAGE,
      currentPage,
    };

    if (initialFilters.status) input.status = initialFilters.status;
    if (initialFilters.priority) input.priority = initialFilters.priority;
    if (initialFilters.startDate)
      input.startDate = initialFilters.startDate.toISOString();
    if (initialFilters.endDate) {
      const end = new Date(initialFilters.endDate);
      end.setHours(23, 59, 59, 999);
      input.endDate = end.toISOString();
    }

    return input;
  }, [initialFilters, currentPage]);

  const { tasks, count, loading } = useGetAllTasks(
    isOpen ? queryInput : undefined
  );

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[90vh] w-[95vw] max-w-7xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-gray-50 p-6 shadow-xl data-[state=open]:animate-contentShow focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center gap-x-4">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {title}
              </Dialog.Title>
              <a
                href="/tasks"
                target="_blank"
                rel="noopener noreferrer"
                title="Отвори в нов прозорец"
                className="flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-800 hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                Отвори таблото
              </a>
            </div>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 focus:outline-none transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="cursor-pointer h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <TaskList tasks={tasks} viewMode="table" loading={loading} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Предишна
                </button>
                <span className="text-sm text-gray-600">
                  Страница {currentPage + 1} от {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Следваща
                </button>
              </div>
            )}

            {/* Results count */}
            {!loading && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Показани {tasks.length} от {count} задачи
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TaskViewerModal;
