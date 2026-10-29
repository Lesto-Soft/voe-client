// src/components/task/taskStatusOptions.tsx
import React from "react";
import { TaskStatus } from "../../db/interfaces";
import {
  ClockIcon,
  PlayCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

/** Task statuses with their labels and icons (status pill, edit form) */
export const TASK_STATUS_OPTIONS: {
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
