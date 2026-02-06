import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TaskStatus } from "../../db/interfaces";
import { useChangeTaskStatus } from "../../graphql/hooks/task";
import { useCurrentUser } from "../../context/UserContext";
import TaskStatusBadge from "./TaskStatusBadge";
import {
  ChevronDownIcon,
  ClockIcon,
  PlayCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface TaskStatusPillProps {
  taskId: string;
  currentStatus: TaskStatus;
  canChange: boolean;
  onStatusChanged?: () => void;
}

const statusOptions: {
  value: TaskStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: TaskStatus.Todo,
    label: "Незапочната",
    icon: <ClockIcon className="h-4 w-4" />,
  },
  {
    value: TaskStatus.InProgress,
    label: "В процес",
    icon: <PlayCircleIcon className="h-4 w-4" />,
  },
  {
    value: TaskStatus.Done,
    label: "Завършена",
    icon: <CheckCircleIcon className="h-4 w-4" />,
  },
];

const TaskStatusPill: React.FC<TaskStatusPillProps> = ({
  taskId,
  currentStatus,
  canChange,
  onStatusChanged,
}) => {
  const { changeTaskStatus, loading } = useChangeTaskStatus(taskId);
  const currentUser = useCurrentUser();

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === currentStatus || !currentUser || loading) {
      return;
    }

    try {
      await changeTaskStatus(taskId, newStatus, currentUser._id);
      onStatusChanged?.();
    } catch (error) {
      console.error("Failed to change status:", error);
    }
  };

  // Non-interactive: just show the badge
  if (!canChange) {
    return <TaskStatusBadge status={currentStatus} size="md" />;
  }

  // Interactive: show badge with dropdown
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          disabled={loading}
          className="inline-flex bg-blue-100 items-center gap-1 cursor-pointer rounded-full transition-all duration-150 hover:ring-2 hover:ring-gray-300 hover:ring-offset-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TaskStatusBadge
            fullRounded={false}
            status={currentStatus}
            size="md"
          />
          <ChevronDownIcon className="h-3.5 w-3.5 -ml-0 mr-1.5 text-current opacity-60" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 min-w-[160px] z-50"
          sideOffset={4}
          align="start"
        >
          {statusOptions.map((option) => {
            const isCurrent = option.value === currentStatus;
            return (
              <DropdownMenu.Item
                key={option.value}
                disabled={isCurrent}
                onSelect={() => handleStatusChange(option.value)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer outline-none transition-colors ${
                  isCurrent
                    ? "bg-blue-50 text-blue-700 font-medium cursor-default"
                    : "text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
                {isCurrent && (
                  <span className="ml-auto text-xs text-blue-500">(текущ)</span>
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default TaskStatusPill;
