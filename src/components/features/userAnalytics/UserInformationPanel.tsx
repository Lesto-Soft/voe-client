// src/components/features/userAnalytics/UserInformationPanel.tsx
import React, { useState, useEffect } from "react"; // Added useEffect
import { IUser, ICategory } from "../../../db/interfaces"; // Adjust path as needed
import UserAvatar from "../../../components/cards/UserAvatar"; // Adjust path as needed
import CategoryLink from "../../../components/global/CategoryLink"; // Adjust path as needed
import {
  AtSymbolIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

interface UserInformationPanelProps {
  user: IUser | undefined | null;
  isLoading?: boolean;
  serverBaseUrl: string;
}

type CategoryRoleTab = "manages" | "expertIn"; // Changed default priority

const UserInformationPanel: React.FC<UserInformationPanelProps> = ({
  user,
  isLoading,
  serverBaseUrl,
}) => {
  // Default to 'manages', will be adjusted by useEffect if needed
  const [activeCategoryRoleTab, setActiveCategoryRoleTab] =
    useState<CategoryRoleTab>("manages");

  useEffect(() => {
    if (user) {
      if (user.managed_categories && user.managed_categories.length > 0) {
        setActiveCategoryRoleTab("manages");
      } else if (user.expert_categories && user.expert_categories.length > 0) {
        setActiveCategoryRoleTab("expertIn");
      }
      // If neither, it will stick to the initial useState value or the last valid one.
      // Or you could set a specific default if both are empty, though the section might not render.
    }
  }, [user]);

  if (isLoading || !user) {
    // Skeleton state remains the same
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-6 space-y-4 animate-pulse">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-24 w-24 bg-gray-300 rounded-full"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
          <hr className="my-4 border-gray-200" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            ))}
          </div>
          <hr className="my-4 border-gray-200" />
          <div className="h-10 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-24 bg-gray-300 rounded w-full"></div>
        </div>
      </aside>
    );
  }

  const avatarUrl = user.avatar
    ? `${serverBaseUrl}/static/avatars/${user._id}/${user.avatar}`
    : undefined;

  const InfoItem: React.FC<{
    icon: React.ElementType;
    label: string;
    value?: string | null | React.ReactNode;
    valueClasses?: string;
  }> = ({ icon: Icon, label, value, valueClasses = "text-gray-700" }) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <div className="flex items-start text-sm">
        <Icon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-grow">
          <span className="text-gray-500">{label}: </span>
          <span className={`font-medium ${valueClasses}`}>{value}</span>
        </div>
      </div>
    );
  };

  const capitalizedRoleName = user.role?.name
    ? user.role.name.charAt(0).toUpperCase() +
      user.role.name.slice(1).toLowerCase()
    : "N/A";

  const renderCategoryList = (
    categories: ICategory[] | undefined,
    type: CategoryRoleTab
  ) => {
    if (!categories || categories.length === 0) {
      return (
        <p className="text-sm text-gray-500 p-4 text-center">
          {type === "expertIn"
            ? "Не е експерт в категории."
            : "Не управлява категории."}
        </p>
      );
    }
    return (
      <ul className="w-full flex flex-wrap gap-2 text-sm text-gray-600 overflow-y-auto max-h-32 lg:max-h-[calc(theme(space.37)-theme(space.2))] px-1 py-1 justify-center items-center">
        {categories.map((category: ICategory) => (
          <li key={category._id} className="flex">
            <CategoryLink {...category} />
          </li>
        ))}
      </ul>
    );
  };

  const hasExpertCategories =
    user.expert_categories && user.expert_categories.length > 0;
  const hasManagedCategories =
    user.managed_categories && user.managed_categories.length > 0;

  return (
    <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col items-center text-center space-y-2">
          <UserAvatar name={user.name} imageUrl={avatarUrl} size={96} />
          <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
          {user.username && (
            <p className="text-sm text-gray-500">@{user.username}</p>
          )}
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="space-y-2.5">
          {user.email && (
            <InfoItem
              icon={AtSymbolIcon}
              label="Имейл"
              value={
                <a
                  href={`mailto:${user.email}`}
                  className="text-blue-600 hover:underline break-all"
                >
                  {user.email}
                </a>
              }
            />
          )}
          <InfoItem
            icon={BriefcaseIcon}
            label="Позиция"
            value={user.position || "N/A"}
          />
          <InfoItem
            icon={ShieldCheckIcon}
            label="Роля"
            value={capitalizedRoleName}
          />
          <InfoItem
            icon={CurrencyDollarIcon}
            label="Финансов отговорник"
            value={user.financial_approver ? "Да" : "Не"}
            valueClasses={
              user.financial_approver ? "text-green-600" : "text-red-600"
            }
          />
        </div>

        {(hasManagedCategories || hasExpertCategories) && ( // Show section only if there's at least one type of category role
          <>
            <hr className="my-4 border-gray-200" />
            <div>
              <div className="flex border-b border-gray-200">
                {/* Manages Categories Tab - Rendered First */}
                {hasManagedCategories && (
                  <button
                    onClick={() => setActiveCategoryRoleTab("manages")}
                    className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                      activeCategoryRoleTab === "manages"
                        ? "border-b-2 border-purple-500 text-purple-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    <CogIcon className="h-5 w-5 mr-1.5 text-purple-600" />
                    Управлява
                  </button>
                )}
                {/* Expert In Categories Tab - Rendered Second */}
                {hasExpertCategories && (
                  <button
                    onClick={() => setActiveCategoryRoleTab("expertIn")}
                    className={`flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                      activeCategoryRoleTab === "expertIn"
                        ? "border-b-2 border-teal-500 text-teal-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    <AcademicCapIcon className="h-5 w-5 mr-1.5 text-teal-600" />
                    Експерт в
                  </button>
                )}
              </div>
              <div className="mt-4 bg-gray-50 rounded-sm border border-gray-300 min-h-20 lg:min-h-[6rem] lg:h-auto flex flex-col justify-center items-center text-center py-2">
                {activeCategoryRoleTab === "manages" &&
                  renderCategoryList(user.managed_categories, "manages")}
                {activeCategoryRoleTab === "expertIn" &&
                  renderCategoryList(user.expert_categories, "expertIn")}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default UserInformationPanel;
