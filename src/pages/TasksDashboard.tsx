// src/pages/TasksDashboard.tsx

import React, { useState, useMemo } from "react";
import {
  ClipboardDocumentCheckIcon,
  UserCircleIcon,
  UsersIcon,
  FlagIcon,
  Bars3Icon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import UserLink from "../components/global/UserLink";
import CaseLink from "../components/global/CaseLink";
import { ICase, IUser } from "../db/interfaces";
import { Link } from "react-router";

// --- Разширени Макетирани Данни ---
const mockUsers: IUser[] = [
  { _id: "1", name: "Иван Петров", username: "ivan.petrov" },
  { _id: "2", name: "Мари Анеева", username: "mari.aneeva" },
  { _id: "3", name: "Петър Иванов", username: "petar.ivanov" },
  { _id: "4", name: "Анна Димитрова", username: "anna.dimitrova" },
];

const mockTasks = [
  {
    id: 1,
    title: "Актуализация на драйверите за принтери в офиса",
    caseNumber: 123,
    priority: "HIGH",
    dueDate: "2025-08-15",
    status: "В процес",
    assignees: [mockUsers[0], mockUsers[1]],
    assignedByMe: true,
  },
  {
    id: 2,
    title: "Поръчка на нова кафе машина за кухнята на",
    caseNumber: 12348,
    priority: "MEDIUM",
    dueDate: "2025-08-20",
    status: "За изпълнение",
    assignees: [mockUsers[0]],
    assignedByMe: false,
  },
  {
    id: 3,
    title: "Проучване на нов софтуер за CRM системата",
    caseNumber: 12349,
    priority: "LOW",
    dueDate: null,
    status: "Завършена",
    assignees: [mockUsers[2]],
    assignedByMe: true,
  },
  {
    id: 4,
    title: "Организация на тиймбилдинг за Q3",
    caseNumber: 12350,
    priority: "MEDIUM",
    dueDate: "2025-09-01",
    status: "За изпълнение",
    assignees: [mockUsers[3]],
    assignedByMe: false,
  },
  {
    id: 5,
    title: "Подмяна на дефектните офис столове",
    caseNumber: 12351,
    priority: "HIGH",
    dueDate: "2025-08-10",
    status: "Завършена",
    assignees: [mockUsers[0]],
    assignedByMe: true,
  },
  {
    id: 6,
    title: "Проверка на пожарогасителите",
    caseNumber: 12352,
    priority: "MEDIUM",
    dueDate: "2025-09-05",
    status: "За изпълнение",
    assignees: [mockUsers[2], mockUsers[3]],
    assignedByMe: false,
  },
  {
    id: 7,
    title: "Планиране на бюджет за следващата година",
    caseNumber: 12355,
    priority: "HIGH",
    dueDate: "2025-10-01",
    status: "В процес",
    assignees: [mockUsers[1]],
    assignedByMe: true,
  },
  {
    id: 8,
    title: "Създаване на нова onboarding процедура за нови служители",
    caseNumber: 12356,
    priority: "LOW",
    dueDate: null,
    status: "За изпълнение",
    assignees: [mockUsers[3]],
    assignedByMe: false,
  },
];

// --- Помощни компоненти за Таблото ---

// "Sticky Note" Карта
const TaskCard: React.FC<{ task: any }> = ({ task }) => {
  const getPriorityBorderStyle = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "border-t-red-500";
      case "MEDIUM":
        return "border-t-yellow-500";
      case "LOW":
        return "border-t-green-500";
      default:
        return "border-t-gray-400";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "В процес":
        return "bg-yellow-100 text-yellow-800";
      case "За изпълнение":
        return "bg-blue-100 text-blue-800";
      case "Завършена":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const t = (key: string) =>
    key === "details_for" ? "Детайли за сигнал" : key;
  const mockCase: ICase = {
    _id: task.caseNumber.toString(),
    case_number: task.caseNumber,
  } as ICase;

  return (
    <Link to={`/task/${task.id}`} className="block">
      {" "}
      {/* Обгръщаме всичко с Link */}
      <div
        className={`bg-white p-4 rounded-lg shadow-md border-t-8 ${getPriorityBorderStyle(
          task.priority
        )} hover:shadow-xl transition-shadow duration-200 flex flex-col`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-gray-800 flex-1 pr-2">
            {task.title}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
              task.status
            )} flex-shrink-0`}
          >
            {task.status}
          </span>
        </div>
        <div className="text-sm text-gray-500 mb-3  w-20">
          От Сигнал: <CaseLink my_case={mockCase} t={t} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-auto pt-3 border-t border-gray-100">
          <div className="text-gray-600">
            <strong className="w-full">Краен срок:</strong>{" "}
            <div>{task.dueDate ? task.dueDate : "-"}</div>
          </div>
          <div className="flex-grow"></div>
          <div className="flex space-x-2">
            {task.assignees.map((user: IUser) => (
              <div key={user._id} title={user.name}>
                <UserLink user={user} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

// Списък със задачи (Мрежа)
const TaskListGrid: React.FC<{ tasks: any[] }> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <ClipboardDocumentCheckIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-semibold">Няма намерени задачи</p>
        <p>Няма задачи, които да отговарят на избраните филтри.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

// Списък със задачи (Таблица)
const TaskTable: React.FC<{ tasks: any[] }> = ({ tasks }) => {
  const t = (key: string) =>
    key === "details_for" ? "Детайли за сигнал" : key;

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <ClipboardDocumentCheckIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-semibold">Няма намерени задачи</p>
        <p>Няма задачи, които да отговарят на избраните филтри.</p>
      </div>
    );
  }
  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Задача
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Приоритет
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Краен Срок
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
            <tr key={task.id} className="hover:bg-gray-50 group">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  to={`/task/${task.id}`}
                  className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
                >
                  {task.title}
                </Link>
                <div className="text-xs text-gray-500 w-25">
                  От Сигнал:{" "}
                  <CaseLink
                    my_case={
                      {
                        _id: task.caseNumber.toString(),
                        case_number: task.caseNumber,
                      } as ICase
                    }
                    t={t}
                  />
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`font-semibold ${
                    task.priority === "HIGH"
                      ? "text-red-600"
                      : task.priority === "MEDIUM"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {task.priority}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {task.dueDate || "Няма"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  {task.assignees.map((user: IUser) => (
                    <div key={user._id} title={user.name}>
                      <UserLink user={user} />
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.status === "В процес"
                      ? "bg-yellow-100 text-yellow-800"
                      : task.status === "За изпълнение"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {task.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Основен Компонент на Страницата ---
const TasksDashboard: React.FC = () => {
  const [filter, setFilter] = useState<"assignedToMe" | "assignedByMe">(
    "assignedToMe"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredTasks = mockTasks.filter((task) => {
    const filterMatch =
      filter === "assignedToMe" ? !task.assignedByMe : task.assignedByMe;
    const statusMatch =
      statusFilter === "all" ? true : task.status === statusFilter;
    return filterMatch && statusMatch;
  });

  return (
    <div className="min-h-full bg-gray-100 p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Табло за Задачи</h1>
        <p className="text-gray-600 mt-1">
          Преглеждайте и управлявайте вашите задачи.
        </p>
      </header>

      {/* Филтри и контроли за изглед */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter("assignedToMe")}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${
              filter === "assignedToMe"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <UserCircleIcon className="h-5 w-5" /> Възложени на мен
          </button>
          <button
            onClick={() => setFilter("assignedByMe")}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${
              filter === "assignedByMe"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <UsersIcon className="h-5 w-5" /> Възложени от мен
          </button>
        </div>
        <div className="flex items-center gap-4">
          <select
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">Всички статуси</option>
            <option value="За изпълнение">За изпълнение</option>
            <option value="В процес">В процес</option>
            <option value="Завършена">Завършена</option>
          </select>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              title="Мрежа"
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              title="Таблица"
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Списък със Задачи (условно рендиране на изгледа) */}
      <main>
        {viewMode === "grid" ? (
          <TaskListGrid tasks={filteredTasks} />
        ) : (
          <TaskTable tasks={filteredTasks} />
        )}
      </main>
    </div>
  );
};

export default TasksDashboard;
