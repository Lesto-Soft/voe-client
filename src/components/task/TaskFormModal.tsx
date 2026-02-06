import React, { useState, useEffect, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import DatePicker, { registerLocale } from "react-datepicker";
import { bg } from "date-fns/locale/bg";
import { XMarkIcon, ClipboardDocumentCheckIcon, XCircleIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ITask, IUser, CasePriority } from "../../db/interfaces";
import { useCreateTask, useUpdateTask } from "../../graphql/hooks/task";
import { useGetAllUsers } from "../../graphql/hooks/user";
import { useCurrentUser } from "../../context/UserContext";
import UserAvatar from "../cards/UserAvatar";
import { endpoint } from "../../db/config";
import CaseAnswerSelector from "./CaseAnswerSelector";

import "react-datepicker/dist/react-datepicker.css";

registerLocale("bg", bg);

// Custom Header Component for the DatePicker
const CustomDatePickerHeader = ({
  date,
  changeYear,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: {
  date: Date;
  changeYear: (year: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear + 5; i >= currentYear - 5; i--) {
    years.push(i);
  }

  return (
    <div className="flex items-center justify-between px-2 py-1 bg-gray-50 border-b border-gray-200">
      <button
        type="button"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
      </button>
      <div className="flex items-baseline gap-x-2">
        <span className="text-sm font-semibold text-gray-800 capitalize">
          {date.toLocaleString("bg-BG", { month: "long" })}
        </span>
        <select
          value={date.getFullYear()}
          onChange={({ target: { value } }) => changeYear(parseInt(value))}
          className="text-sm font-semibold text-gray-700 bg-transparent border-0 cursor-pointer focus:ring-0 p-0"
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

interface TaskFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  task?: ITask;
  relatedCaseId?: string;
  initialDescription?: string;
  onSuccess?: () => void;
}

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
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch users for assignee dropdown
  const { users } = useGetAllUsers({ itemsPerPage: 1000, currentPage: 0 });

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!assigneeSearchQuery.trim()) return users || [];
    const query = assigneeSearchQuery.toLowerCase();
    return (users || []).filter((user: IUser) =>
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
  }, [users, assigneeSearchQuery]);

  // Initialize form when opening in edit mode
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setPriority(task.priority);
        setDueDate(task.dueDate ? new Date(task.dueDate) : null);
        setAssigneeId(task.assignee?._id || "");
      } else {
        // Reset form for create mode, use initialDescription if provided
        setTitle("");
        setDescription(initialDescription || "");
        setPriority(CasePriority.Medium);
        setDueDate(null);
        setAssigneeId("");
      }
      setAssigneeSearchQuery("");
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
          dueDate: dueDate ? dueDate.toISOString() : undefined,
          assignee: assigneeId || undefined,
          creator: currentUser._id,
          relatedCase: relatedCaseId,
        });
      } else if (task) {
        await updateTask(task._id, {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate ? dueDate.toISOString() : undefined,
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Възникна грешка");
    }
  };

  const isLoading = createLoading || updateLoading;

  // Get selected user for display
  const selectedUser = users?.find((u: IUser) => u._id === assigneeId);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-xl focus:outline-none max-h-[90vh] overflow-y-auto">
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

              {/* Case Answer Selector - only show in create mode when relatedCaseId is provided */}
              {mode === "create" && relatedCaseId && (
                <CaseAnswerSelector
                  caseId={relatedCaseId}
                  onSelect={(content) => setDescription(content)}
                />
              )}

              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Въведете описание на задачата"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Приоритет
              </label>
              <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                {[
                  { value: CasePriority.Low, color: "#009b00", label: "Нисък" },
                  { value: CasePriority.Medium, color: "#ad8600", label: "Среден" },
                  { value: CasePriority.High, color: "#c30505", label: "Висок" },
                ].map(({ value, color, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                  >
                    <input
                      type="radio"
                      value={value}
                      checked={priority === value}
                      onChange={() => setPriority(value)}
                      style={{ accentColor: color }}
                      className="w-5 h-5 cursor-pointer"
                      name="task-priority"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Due Date with DatePicker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Краен срок
              </label>
              <div className="relative">
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => setDueDate(date)}
                  dateFormat="dd/MM/yyyy"
                  locale="bg"
                  minDate={new Date()}
                  placeholderText="Изберете дата"
                  isClearable
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={10}
                  renderCustomHeader={(props) => <CustomDatePickerHeader {...props} />}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer"
                  calendarClassName="font-mulish"
                  popperPlacement="bottom-start"
                />
              </div>
            </div>

            {/* Assignee - only show in create mode with smart search */}
            {mode === "create" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Възложи на
                </label>

                {/* Search input */}
                <input
                  type="text"
                  value={assigneeSearchQuery}
                  onChange={(e) => setAssigneeSearchQuery(e.target.value)}
                  placeholder="Търси потребител..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
                />

                {/* Scrollable user list */}
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-white">
                  <button
                    type="button"
                    onClick={() => setAssigneeId("")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${!assigneeId ? "bg-blue-50" : ""}`}
                  >
                    -- Без възложен --
                  </button>
                  {filteredUsers.map((user: IUser) => (
                    <button
                      type="button"
                      key={user._id}
                      onClick={() => setAssigneeId(user._id)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 ${
                        assigneeId === user._id ? "bg-blue-100" : ""
                      }`}
                    >
                      <UserAvatar
                        name={user.name}
                        imageUrl={user.avatar
                          ? `${endpoint}/static/avatars/${user._id}/${user.avatar}`
                          : null}
                        size={24}
                      />
                      <span className="flex-1">{user.name}</span>
                      <span className="text-gray-500 text-xs">({user.username})</span>
                    </button>
                  ))}
                </div>

                {/* Show selected user */}
                {selectedUser && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                    <UserAvatar
                      name={selectedUser.name}
                      imageUrl={selectedUser.avatar
                        ? `${endpoint}/static/avatars/${selectedUser._id}/${selectedUser.avatar}`
                        : null}
                      size={24}
                    />
                    <span className="text-sm text-gray-700">{selectedUser.name}</span>
                    <button
                      type="button"
                      onClick={() => setAssigneeId("")}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
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
