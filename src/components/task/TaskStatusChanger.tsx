import React, { useState } from "react";
import { TaskStatus } from "../../db/interfaces";
import { useChangeTaskStatus } from "../../graphql/hooks/task";
import { useCurrentUser } from "../../context/UserContext";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface TaskStatusChangerProps {
  taskId: string;
  currentStatus: TaskStatus;
  onStatusChanged?: () => void;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: TaskStatus.Todo, label: "За изпълнение" },
  { value: TaskStatus.InProgress, label: "В процес" },
  { value: TaskStatus.Done, label: "Завършена" },
];

const TaskStatusChanger: React.FC<TaskStatusChangerProps> = ({
  taskId,
  currentStatus,
  onStatusChanged,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { changeTaskStatus, loading } = useChangeTaskStatus(taskId);
  const currentUser = useCurrentUser();

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === currentStatus || !currentUser) {
      setIsOpen(false);
      return;
    }

    try {
      await changeTaskStatus(taskId, newStatus, currentUser._id);
      onStatusChanged?.();
    } catch (error) {
      console.error("Failed to change status:", error);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? "..." : "Промени статус"}
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={option.value === currentStatus}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md ${
                  option.value === currentStatus
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700"
                }`}
              >
                {option.label}
                {option.value === currentStatus && " (текущ)"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskStatusChanger;
