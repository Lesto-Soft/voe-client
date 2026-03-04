import React from "react";
import { Link } from "react-router";
import { ITask } from "../../db/interfaces";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskPriorityBadge from "./TaskPriorityBadge";
import { getDueDateStatus } from "./TaskDueDateIndicator";
import TaskLink from "../global/links/TaskLink";
import CaseLink from "../global/links/CaseLink";
import UserLink from "../global/links/UserLink";
import ShowDate from "../global/ShowDate";
import {
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import DataTable, { DataTableColumn } from "../tables/DataTable";

interface TaskTableProps {
  tasks: ITask[];
}

const columns: DataTableColumn<ITask>[] = [
  {
    key: "number",
    header: "Номер",
    width: "w-[7%]",
    cellClassName: "whitespace-nowrap",
    render: (task) => <TaskLink task={task} />,
  },
  {
    key: "title",
    header: "Задача",
    width: "w-[22%]",
    cellClassName: "whitespace-nowrap",
    render: (task) => (
      <Link
        to={`/tasks/${task.taskNumber}`}
        className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors max-w-xs truncate block"
        title={task.title}
      >
        {task.title}
      </Link>
    ),
  },
  {
    key: "relatedCase",
    header: "От Сигнал",
    width: "w-[9%]",
    cellClassName: "whitespace-nowrap",
    render: (task) =>
      task.relatedCase ? (
        <div className="w-20">
          <CaseLink my_case={task.relatedCase} />
        </div>
      ) : (
        <span className="text-gray-400 text-sm">—</span>
      ),
  },
  {
    key: "priority",
    header: "Приоритет",
    width: "w-[10%]",
    cellClassName: "whitespace-nowrap",
    render: (task) => <TaskPriorityBadge priority={task.priority} />,
  },
  {
    key: "dueDate",
    header: "Краен Срок",
    width: "w-[13%]",
    cellClassName: "whitespace-nowrap",
    render: (task) =>
      task.dueDate ? (
        <div className="flex items-center gap-1.5">
          <ShowDate date={task.dueDate} />
          {getDueDateStatus(task.dueDate, task.status) === "overdue" && (
            <span title="Просрочена задача">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
            </span>
          )}
          {getDueDateStatus(task.dueDate, task.status) === "warning" && (
            <span title="Краен срок наближава">
              <ClockIcon className="h-4 w-4 text-amber-500" />
            </span>
          )}
        </div>
      ) : (
        <span className="text-gray-400 text-sm">—</span>
      ),
  },
  {
    key: "creator",
    header: "Създадена от",
    width: "w-[13%]",
    cellClassName: "whitespace-nowrap",
    render: (task) => <UserLink user={task.creator} />,
  },
  {
    key: "assignee",
    header: "Възложена на",
    width: "w-[13%]",
    cellClassName: "whitespace-nowrap",
    render: (task) =>
      task.assignee ? (
        <UserLink user={task.assignee} />
      ) : (
        <span className="text-gray-400 text-sm">Невъзложена</span>
      ),
  },
  {
    key: "status",
    header: "Статус",
    width: "w-[13%]",
    cellClassName: "whitespace-nowrap",
    render: (task) => <TaskStatusBadge status={task.status} />,
  },
];

const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
  return (
    <DataTable
      columns={columns}
      data={tasks}
      rowKey={(task) => task._id}
    />
  );
};

export default TaskTable;
