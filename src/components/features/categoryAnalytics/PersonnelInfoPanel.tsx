// src/components/features/categoryAnalytics/PersonnelInfoPanel.tsx
import React from "react";
import { ICategory, IUser } from "../../../db/interfaces"; // Adjust path as needed
import UserLink from "../../../components/global/UserLink"; // Adjust path as needed
import {
  UserGroupIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface PersonnelInfoPanelProps {
  category: ICategory | undefined | null;
  activePersonnelTab: "experts" | "managers";
  setActivePersonnelTab: (tab: "experts" | "managers") => void;
  activeInfoTab: "suggestion" | "problem";
  setActiveInfoTab: (tab: "suggestion" | "problem") => void;
}

const PersonnelInfoPanel: React.FC<PersonnelInfoPanelProps> = ({
  category,
  activePersonnelTab,
  setActivePersonnelTab,
  activeInfoTab,
  setActiveInfoTab,
}) => {
  if (!category) {
    // Optionally, render a skeleton or a compact loading state here
    // For now, it will just render nothing if category is not available.
    // The main page can show a more prominent loading/error state.
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-6 space-y-6 overflow-y-auto flex-1 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-40 bg-gray-200 rounded w-full"></div>
        </div>
      </aside>
    );
  }

  const renderUserList = (users: IUser[] | undefined, type: string) => {
    if (!users || users.length === 0) {
      return (
        <p className="text-sm text-gray-500 p-4 text-center">
          {type === "experts"
            ? "Няма посочени експерти."
            : "Няма посочени мениджъри."}
        </p>
      );
    }
    return (
      <ul className="w-full flex flex-wrap gap-2 text-sm text-gray-600 overflow-y-auto max-h-32 lg:max-h-[calc(theme(space.37)-theme(space.2))] px-1 py-1 justify-center items-center">
        {users.map((user: IUser) => (
          <li key={user._id} className="flex">
            <UserLink user={user} type="table" />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
        {/* Personnel Tabs (Experts/Managers) */}
        <div>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActivePersonnelTab("experts")}
              className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                activePersonnelTab === "experts"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              }`}
            >
              <UserGroupIcon className="h-5 w-5 mr-1.5 text-indigo-600" />
              Експерти
            </button>
            <button
              onClick={() => setActivePersonnelTab("managers")}
              className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                activePersonnelTab === "managers"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              }`}
            >
              <UserGroupIcon className="h-5 w-5 mr-1.5 text-blue-600" />
              Мениджъри
            </button>
          </div>
          <div className="mt-4 bg-gray-50 rounded-sm border border-gray-300 min-h-20 lg:h-37 flex flex-col justify-center items-center text-center">
            {activePersonnelTab === "experts" &&
              renderUserList(category.experts, "experts")}
            {activePersonnelTab === "managers" &&
              renderUserList(category.managers, "managers")}
          </div>
        </div>

        {/* Info Tabs (Suggestion/Problem) */}
        <div>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveInfoTab("suggestion")}
              className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                activeInfoTab === "suggestion"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              }`}
            >
              <LightBulbIcon className="h-5 w-5 mr-1.5 text-green-500" />
              Предложение
            </button>
            <button
              onClick={() => setActiveInfoTab("problem")}
              className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                activeInfoTab === "problem"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              }`}
            >
              <ExclamationTriangleIcon className="h-5 w-5 mr-1.5 text-red-600" />
              Проблем
            </button>
          </div>
          <div className="mt-4 prose prose-sm max-w-none text-gray-700 leading-relaxed">
            {activeInfoTab === "suggestion" &&
              (category.suggestion ? (
                <div
                  dangerouslySetInnerHTML={{ __html: category.suggestion }}
                />
              ) : (
                <p className="text-sm text-gray-500 p-4 text-center">
                  Няма информация за предложение.
                </p>
              ))}
            {activeInfoTab === "problem" &&
              (category.problem ? (
                <div dangerouslySetInnerHTML={{ __html: category.problem }} />
              ) : (
                <p className="text-sm text-gray-500 p-4 text-center">
                  Няма информация за проблем.
                </p>
              ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PersonnelInfoPanel;
