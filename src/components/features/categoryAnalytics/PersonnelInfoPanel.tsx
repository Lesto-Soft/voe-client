// src/components/features/categoryAnalytics/PersonnelInfoPanel.tsx
import React, { useState, useEffect, useMemo } from "react";
import { ICategory, IUser } from "../../../db/interfaces"; // Adjust path as needed
import UserLink from "../../../components/global/UserLink"; // Adjust path as needed
import {
  UserGroupIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { TagIcon } from "@heroicons/react/24/solid";
import * as Tooltip from "@radix-ui/react-tooltip";

// Note: No need for useCurrentUser or role checks here.
// All permission logic is handled in the parent `Category.tsx` page.

interface PersonnelInfoPanelProps {
  category: ICategory | undefined | null;
  activePersonnelTab: "experts" | "managers";
  setActivePersonnelTab: (tab: "experts" | "managers") => void;
  activeInfoTab: "suggestion" | "problem";
  setActiveInfoTab: (tab: "suggestion" | "problem") => void;
  // --- NEW: Props for editing functionality ---
  canEdit: boolean;
  onEditClick: () => void;
  isMisconfigured?: boolean;
}

const PersonnelInfoPanel: React.FC<PersonnelInfoPanelProps> = ({
  category,
  activePersonnelTab,
  setActivePersonnelTab,
  activeInfoTab,
  setActiveInfoTab,
  // --- NEW: Destructure new props ---
  canEdit,
  onEditClick,
  isMisconfigured = false,
}) => {
  const [isWarningVisible, setIsWarningVisible] = useState(true); // add state for warning

  useEffect(() => {
    if (isMisconfigured) {
      setIsWarningVisible(true);
    }
  }, [isMisconfigured]);

  // create specific checks for each role
  const hasNoExperts = !category?.experts || category.experts.length === 0;
  const hasNoManagers = !category?.managers || category.managers.length === 0;

  // create a dynamic warning message
  const warningMessage = useMemo(() => {
    if (hasNoExperts && hasNoManagers) {
      return "Тази категория няма назначени експерти или мениджъри.";
    }
    if (hasNoExperts) {
      return "Тази категория няма назначени експерти.";
    }
    if (hasNoManagers) {
      return "Тази категория няма назначени мениджъри.";
    }
    return ""; // Should not happen if isMisconfigured is true
  }, [hasNoExperts, hasNoManagers]);

  if (!category) {
    // Skeleton remains the same, no changes needed here.
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-7 bg-gray-300 rounded w-3/4 mb-3"></div>
          <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
          <div className="h-32 bg-gray-300 rounded w-full mb-6"></div>
          <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
          <div className="h-40 bg-gray-200 rounded w-full"></div>
        </div>
      </aside>
    );
  }

  const renderUserList = (users: IUser[] | undefined, type: string) => {
    // ... (renderUserList remains the same)
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
            <UserLink user={user} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar-xs">
        {/* Category Name Display */}
        <div className="mb-4 pb-3 border-b border-gray-200">
          <div className="flex justify-between items-start gap-2">
            <h1 className="text-xl font-bold text-gray-800 flex items-center min-w-0">
              <TagIcon
                className="h-6 w-6 mr-2 flex-shrink-0"
                style={{ color: category.color || "text-gray-500" }} // Use inline style
              />
              <span className="truncate" title={category.name}>
                {category.name}
              </span>
            </h1>

            {/* conditionally rendered Edit Button */}
            {canEdit && (
              <button
                onClick={onEditClick}
                // conditionally apply animation class
                className={`hover:cursor-pointer flex-shrink-0 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                  isMisconfigured ? "animate-pulse-glow" : ""
                }`}
                title="Редактирай категория"
              >
                <PencilSquareIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* the outer div now controls the hide/show animation */}
        {isMisconfigured && (
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isWarningVisible ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-3 text-sm text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>
                  <strong>Внимание:</strong> {warningMessage}
                </span>
              </div>
              <button
                onClick={() => setIsWarningVisible(false)}
                className="p-1 rounded-md hover:bg-yellow-200 transition-colors cursor-pointer"
                aria-label="Скрий предупреждението"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Personnel Tabs (Managers/Experts) */}
        <div>
          {/* ... The rest of the component remains unchanged ... */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActivePersonnelTab("experts")}
              className={`hover:cursor-pointer flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                activePersonnelTab === "experts"
                  ? "border-b-2 border-teal-500 text-teal-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              }`}
            >
              <UserGroupIcon className="h-5 w-5 mr-1.5 text-teal-600" />
              Експерти
              {isMisconfigured && hasNoExperts && (
                <Tooltip.Provider delayDuration={100}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span className="ml-1.5">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                      </span>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        sideOffset={5}
                        className="z-50 max-w-xs rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white shadow-lg"
                      >
                        Няма посочени експерти
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}
            </button>
            <button
              onClick={() => setActivePersonnelTab("managers")}
              className={`hover:cursor-pointer flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                activePersonnelTab === "managers"
                  ? "border-b-2 border-purple-500 text-purple-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              }`}
            >
              <UserGroupIcon className="h-5 w-5 mr-1.5 text-purple-600" />
              Мениджъри
              {isMisconfigured && hasNoManagers && (
                <Tooltip.Provider delayDuration={100}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span className="ml-1.5">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                      </span>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        sideOffset={5}
                        className="z-50 max-w-xs rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white shadow-lg"
                      >
                        Няма посочени мениджъри
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}
            </button>
          </div>
          <div className="mt-4 bg-gray-50 rounded-sm border border-gray-300 min-h-20 lg:h-37 flex flex-col justify-center items-center text-center">
            {activePersonnelTab === "managers" &&
              renderUserList(category.managers, "managers")}
            {activePersonnelTab === "experts" &&
              renderUserList(category.experts, "experts")}
          </div>
        </div>

        {/* Info Tabs (Suggestion/Problem) */}
        <div>
          {/* ... (Info Tabs JSX remains the same) ... */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveInfoTab("suggestion")}
              className={`hover:cursor-pointer flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                activeInfoTab === "suggestion"
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              }`}
            >
              <LightBulbIcon className="h-5 w-5 mr-1.5 text-green-500" />
              Предложение
            </button>
            <button
              onClick={() => setActiveInfoTab("problem")}
              className={`hover:cursor-pointer flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                activeInfoTab === "problem"
                  ? "border-b-2 border-red-500 text-red-600"
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
