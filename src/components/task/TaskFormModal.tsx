import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { ITask, IUser, CasePriority } from "../../db/interfaces";
import { useCreateTask, useUpdateTask } from "../../graphql/hooks/task";
import { useGetAllUsers } from "../../graphql/hooks/user";
import { useCurrentUser } from "../../context/UserContext";

interface TaskFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  task?: ITask;
  relatedCaseId?: string;
  initialDescription?: string;
  onSuccess?: () => void;
}

const priorityOptions: { value: CasePriority; label: string }[] = [
  { value: CasePriority.Low, label: "Нисък" },
  { value: CasePriority.Medium, label: "Среден" },
  { value: CasePriority.High, label: "Висок" },
];

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
  task,
  relatedCaseId,
  initialDescription,
  onSuccess,
}) => {
  const currentUser = useCurrentUser();
  const { createTask, loading: createLoading } = useCreateTask();
  const { updateTask, loading: updateLoading } = useUpdateTask(task?._id);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<CasePriority>(CasePriority.Medium);
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Fetch users for assignee dropdown
  const { users } = useGetAllUsers({ itemsPerPage: 1000, currentPage: 0 });

  // Initialize form when opening in edit mode
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setPriority(task.priority);
        setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
        setAssigneeId(task.assignee?._id || "");
      } else {
        // Reset form for create mode, use initialDescription if provided
        setTitle("");
        setDescription(initialDescription || "");
        setPriority(CasePriority.Medium);
        setDueDate("");
        setAssigneeId("");
      }
      setError(null);
    }
  }, [isOpen, mode, task, initialDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Заглавието е задължително");
      return;
    }

    try {
      if (mode === "create") {
        await createTask({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          assignee: assigneeId || undefined,
          creator: currentUser._id,
          relatedCase: relatedCaseId,
        });
      } else if (task) {
        await updateTask(task._id, {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Възникна грешка");
    }
  };

  const isLoading = createLoading || updateLoading;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-rose-500" />
              {mode === "create" ? "Нова задача" : "Редактиране на задача"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Затвори"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label
                htmlFor="task-title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Заглавие <span className="text-red-500">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Въведете заглавие на задачата"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="task-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Описание
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Въведете описание на задачата"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Priority and Due Date row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label
                  htmlFor="task-priority"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Приоритет
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as CasePriority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label
                  htmlFor="task-duedate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Краен срок
                </label>
                <input
                  id="task-duedate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Assignee - only show in create mode */}
            {mode === "create" && (
              <div>
                <label
                  htmlFor="task-assignee"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Възложи на
                </label>
                <select
                  id="task-assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                >
                  <option value="">-- Без възложен --</option>
                  {users?.map((user: IUser) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  Отмени
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Запазване..."
                  : mode === "create"
                  ? "Създай"
                  : "Запази"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TaskFormModal;
