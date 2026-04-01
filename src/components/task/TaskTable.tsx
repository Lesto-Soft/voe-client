import React from "react";
import { ITask, TaskStatus } from "../../db/interfaces";
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
import { getContentPreview, stripHtmlTags } from "../../utils/contentRenderer";

interface TaskTableProps {
  tasks: ITask[];
}

const columns: DataTableColumn<ITask>[] = [
  {
    key: "number",
    header: "Номер",
    width: "w-[5%]",
    cellClassName: "whitespace-nowrap",
    render: (task) => <TaskLink task={task} />,
  },
  {
    key: "priority",
    header: "Приоритет",
    width: "w-[7%]",
    cellClassName: "whitespace-nowrap",
    render: (task) => <TaskPriorityBadge priority={task.priority} />,
  },
  {
    key: "relatedCase",
    header: "Сигнал",
    width: "w-[6%]",
    cellClassName: "whitespace-nowrap text-sm",
    render: (task) =>
      task.relatedCase ? (
        <CaseLink my_case={task.relatedCase} />
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },
  {
    key: "creator",
    header: "Създадена от",
    width: "w-[10%]",
    cellClassName: "whitespace-nowrap",
    render: (task) => <UserLink user={task.creator} />,
  },
  {
    key: "assignee",
    header: "Възложена на",
    width: "w-[10%]",
    cellClassName: "whitespace-nowrap",
    render: (task) =>
      task.assignee ? (
        <UserLink user={task.assignee} />
      ) : (
        <span className="text-gray-400 text-sm">Невъзложена</span>
      ),
  },
  {
    key: "title",
    header: "Заглавие",
    width: "w-[12%]",
    cellClassName: "text-sm",
    render: (task) => (
      <span className="font-semibold truncate block" title={task.title}>
        {getContentPreview(task.title, 20)}
      </span>
    ),
  },
  {
    key: "description",
    header: "Описание",
    width: "w-[14%]",
    cellClassName: "text-sm",
    render: (task) =>
      task.description ? (
        <span
          className="block truncate"
          title={stripHtmlTags(task.description)}
        >
          {getContentPreview(task.description, 25)}
        </span>
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },
  {
    key: "dueDate",
    header: "Краен Срок",
    width: "w-[10%]",
    cellClassName: "whitespace-nowrap",
    render: (task) =>
      task.dueDate ? (
        <div className="flex items-center gap-1.5">
          <ShowDate date={task.dueDate} defaultFull />
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
    key: "createdAt",
    header: "Създадена на",
    width: "w-[10%]",
    cellClassName: "whitespace-nowrap",
    render: (task) =>
      task.createdAt ? (
        <ShowDate date={task.createdAt} defaultFull />
      ) : (
        <span className="text-gray-400 text-sm">—</span>
      ),
  },
  {
    key: "status",
    header: "Статус",
    width: "w-[9%]",
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
      rowClassName={(task) =>
        task.status === TaskStatus.Done
          ? "bg-gray-100 text-gray-500"
          : "transition-colors duration-150 hover:bg-gray-50"
      }
    />
  );
};

export default TaskTable;
