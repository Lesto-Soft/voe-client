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
import TaskLink from "../components/global/TaskLink";

// --- Mock Data ---
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
    priority: "ВИСОК",
    dueDate: "2025-08-15",
    status: "Процес",
    assignees: [mockUsers[0], mockUsers[1]],
    creator: mockUsers[2],
    assignedByMe: true,
  },
  {
    id: 2,
    title: "Поръчка на нова кафе машина за кухнята на",
    caseNumber: 183,
    priority: "СРЕДЕН",
    dueDate: "2025-08-20",
    status: "За изпълнение",
    assignees: [mockUsers[0]],
    creator: mockUsers[1],
    assignedByMe: false,
  },
  {
    id: 3,
    title: "Проучване на нов софтуер за CRM системата",
    caseNumber: 139,
    priority: "НИСЪК",
    dueDate: null,
    status: "Завършена",
    assignees: [mockUsers[2]],
    creator: mockUsers[0],
    assignedByMe: true,
  },
  {
    id: 4,
    title: "Организация на тиймбилдинг за Q3",
    caseNumber: 156,
    priority: "СРЕДЕН",
    dueDate: "2025-09-01",
    status: "За изпълнение",
    assignees: [mockUsers[3]],
    creator: mockUsers[2],
    assignedByMe: false,
  },
  {
    id: 5,
    title: "Подмяна на дефектните офис столове",
    caseNumber: 131,
    priority: "ВИСОК",
    dueDate: "2025-08-10",
    status: "Завършена",
    assignees: [mockUsers[0]],
    creator: mockUsers[3],
    assignedByMe: true,
  },
  {
    id: 6,
    title: "Проверка на пожарогасителите",
    caseNumber: 125,
    priority: "СРЕДЕН",
    dueDate: "2025-09-05",
    status: "За изпълнение",
    assignees: [mockUsers[2]],
    creator: mockUsers[0],
    assignedByMe: false,
  },
  {
    id: 7,
    title: "Планиране на бюджет за следващата година",
    caseNumber: 127,
    priority: "ВИСОК",
    dueDate: "2025-10-01",
    status: "Процес",
    assignees: [mockUsers[1]],
    creator: mockUsers[2],
    assignedByMe: true,
  },
  {
    id: 8,
    title: "Създаване на нова onboarding процедура",
    caseNumber: 126,
    priority: "НИСЪК",
    dueDate: null,
    status: "За изпълнение",
    assignees: [mockUsers[3]],
    creator: mockUsers[1],
    assignedByMe: false,
  },
];

// --- Dashboard Helper Components ---

// "Sticky Note" Card
const TaskCard: React.FC<{ task: any }> = ({ task }) => {
  const getPriorityBorderStyle = (priority: string) => {
    switch (priority) {
      case "ВИСОК":
        return "border-t-red-500";
      case "СРЕДЕН":
        return "border-t-yellow-500";
      case "НИСЪК":
        return "border-t-green-500";
      default:
        return "border-t-gray-400";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Процес":
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
      {/* --- CHANGE START: Reworked card layout for consistent alignment --- */}
      <div
        className={`bg-white p-4 rounded-lg shadow-md border-t-8 ${getPriorityBorderStyle(
          task.priority
        )} hover:shadow-xl transition-shadow duration-200 flex flex-col h-52`} // Fixed height is crucial
      >
        {/* Top Section: Title and Status (variable height) */}
        <div className="flex-shrink-0">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-bold text-gray-800 flex-1 pr-2 line-clamp-3">
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
        </div>

        {/* Spacer: This div will grow and push the bottom content down */}
        <div className="flex-grow"></div>

        {/* Bottom Section: All metadata grouped here for consistent alignment */}
        <div className="flex-shrink-0 divide-y divide-gray-100">
          {/* Upper part of the bottom section */}
          <div className="pb-3 text-xs text-gray-500 space-y-2">
            <div className="flex items-center gap-2"></div>
            <div className="flex items-center gap-2">
              <span>Задача:</span>
              <div>
                <TaskLink task={task} />
              </div>

              <span>Сигнал:</span>
              <div>
                <CaseLink my_case={mockCase} t={t} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>Възложена от:</span>
              <UserLink user={task.creator} />
            </div>
          </div>

          {/* Lower part of the bottom section */}
          <div className="pt-3 text-sm">
            <div className="flex justify-between items-end">
              <div className="text-gray-600">
                <strong className="text-gray-500 text-xs">Краен срок:</strong>
                <p className="text-sm font-medium">
                  {task.dueDate ? task.dueDate : "Няма"}
                </p>
              </div>
              <div className="flex space-x-2 overflow-hidden">
                {task.assignees.map((user: IUser) => (
                  <div key={user._id} title={user.name}>
                    <UserLink user={user} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* --- CHANGE END --- */}
    </Link>
  );
};

// Task List (Grid View)
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

// Task List (Table View)
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
            {/* --- CHANGE START: Added "Номер" column header --- */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Номер
            </th>
            {/* --- CHANGE END --- */}
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
              Възложена от
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
              {/* --- CHANGE START: Added new first cell for TaskLink --- */}
              <td className="px-6 py-4 whitespace-nowrap">
                <TaskLink task={task} />
              </td>
              {/* --- CHANGE END --- */}

              {/* --- CHANGE START: Simplified "Задача" cell --- */}
              <td className="px-6 py-4 whitespace-nowrap">
                <Link
                  to={`/task/${task.id}`}
                  className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
                  title={task.title}
                >
                  {task.title}
                </Link>
              </td>
              {/* --- CHANGE END --- */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-15 ">
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
                  className={`font-semibold text-sm flex gap-2 items-center ${
                    task.priority === "ВИСОК"
                      ? "text-red-600"
                      : task.priority === "СРЕДЕН"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  <FlagIcon className="h-4 w-4" /> {task.priority}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {task.dueDate || "Няма"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <UserLink user={task.creator} />
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
                    task.status === "Процес"
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

// --- Main Page Component ---
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

      {/* Filters and View Controls */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter("assignedToMe")}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${
              filter === "assignedToMe"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <UserCircleIcon className="h-5 w-5" /> Възложени на мен
          </button>
          <button
            onClick={() => setFilter("assignedByMe")}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-colors ${
              filter === "assignedByMe"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-200 cursor-pointer"
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
            <option value="Процес">В процес</option>
            <option value="Завършена">Завършена</option>
          </select>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              title="Мрежа"
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200 cursor-pointer"
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
                  : "text-gray-600 hover:bg-gray-200 cursor-pointer"
              }`}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Task List (conditionally rendering the view) */}
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
