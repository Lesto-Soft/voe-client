import React from "react";
import { Link } from "react-router";
import { ITask } from "../../db/interfaces";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskLink from "../global/links/TaskLink";
import CaseLink from "../global/links/CaseLink";
import UserLink from "../global/links/UserLink";
import { useTranslation } from "react-i18next";

interface TaskTableProps {
  tasks: ITask[];
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
  const { t } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Няма";
    return new Date(dateString).toLocaleDateString("bg-BG");
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Номер
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Задача
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              От Сигнал
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Приоритет
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Краен Срок
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Създадена от
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Възложена на
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task._id} className="hover:bg-gray-50 group">
              <td className="px-6 py-4 whitespace-nowrap">
                <TaskLink task={task} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  to={`/tasks/${task.taskNumber}`}
                  className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors max-w-xs truncate block"
                  title={task.title}
                >
                  {task.title}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {task.relatedCase ? (
                  <div className="w-20">
                    <CaseLink my_case={task.relatedCase} t={t} />
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <TaskPriorityBadge priority={task.priority} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatDate(task.dueDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <UserLink user={task.creator} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {task.assignee ? (
                  <UserLink user={task.assignee} />
                ) : (
                  <span className="text-gray-400 text-sm">Невъзложена</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <TaskStatusBadge status={task.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
