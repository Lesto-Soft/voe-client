import React, { useState, useEffect } from "react";
import { IUser, ICategory } from "../../../db/interfaces";
import UserAvatar from "../../../components/cards/UserAvatar";
import CategoryLink from "../../../components/global/links/CategoryLink";
import {
  AtSymbolIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CogIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import HoverTooltip from "../../global/HoverTooltip";

interface UserInformationPanelProps {
  user: IUser | undefined | null;
  isLoading?: boolean;
  serverBaseUrl: string;
  onEditUser: () => void;
  canEdit: boolean;
  isMisconfigured?: boolean;
}

type CategoryRoleTab = "manages" | "expertIn";

const UserInformationPanel: React.FC<UserInformationPanelProps> = ({
  user,
  isLoading,
  serverBaseUrl,
  onEditUser,
  canEdit,
  isMisconfigured = false,
}) => {
  const [activeCategoryRoleTab, setActiveCategoryRoleTab] =
    useState<CategoryRoleTab>("manages");
  const [isWarningVisible, setIsWarningVisible] = useState(true); // add state for the warning message

  useEffect(() => {
    if (user) {
      if (user.managed_categories && user.managed_categories.length > 0) {
        setActiveCategoryRoleTab("manages");
      } else if (user.expert_categories && user.expert_categories.length > 0) {
        setActiveCategoryRoleTab("expertIn");
      }
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
            {[...Array(5)].map(
              (
                _,
                i // Changed to 5 for the new item
              ) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              )
            )}
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
    <aside className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden h-full">
      <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar-xs">
        <div className="relative flex flex-col items-center text-center space-y-2">
          {canEdit && (
            // conditionally apply animation class
            <button
              onClick={onEditUser}
              className="hover:cursor-pointer absolute top-0 right-0 p-1 text-gray-500 rounded-md hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              //isMisconfigured ? "animate-pulse-glow" : ""

              title="Редактирай потребител"
            >
              <PencilSquareIcon className="h-6 w-6" />
            </button>
          )}
          <UserAvatar
            name={user.name}
            imageUrl={avatarUrl}
            size={96}
            enablePreview={true}
          />
          <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
          {user.username && (
            <p className="text-sm text-gray-500">@{user.username}</p>
          )}
        </div>

        {/* conditionally render the warning message */}
        {isMisconfigured && isWarningVisible && (
          <div className="p-3 text-sm text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>
                <strong>Внимание:</strong> Този експерт няма зададени категории.
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
        )}

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
            value={
              <span className="inline-flex items-center">
                <span>
                  {capitalizedRoleName +
                    (user.managed_categories &&
                    user.managed_categories.length > 0
                      ? " - Мениджър"
                      : "")}
                </span>
                {isMisconfigured && (
                  <HoverTooltip content="Експерт без зададени категории">
                    <span className="ml-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    </span>
                  </HoverTooltip>
                )}
              </span>
            }
          />
          <InfoItem
            icon={CurrencyDollarIcon}
            label="Финансов отговорник"
            value={user.financial_approver ? "Да" : "Не"}
            valueClasses={
              user.financial_approver ? "text-green-600" : "text-red-600"
            }
          />
          {/* --- MODIFIED BLOCK --- */}
          {canEdit && user.last_login && (
            <InfoItem
              icon={ClockIcon}
              label="Последно влизане"
              value={
                user.last_login
                  ? new Date(Number(user.last_login)).toLocaleString("bg-BG", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-" // Fallback if last_login is not defined (functionality was implemented around 18.08.2025)
              }
            />
          )}
        </div>

        {(hasManagedCategories || hasExpertCategories) && (
          <>
            <hr className="my-4 border-gray-200" />
            <div>
              <div className="flex border-b border-gray-200">
                {hasManagedCategories && (
                  <button
                    onClick={() => setActiveCategoryRoleTab("manages")}
                    className={`hover:cursor-pointer flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
                      activeCategoryRoleTab === "manages"
                        ? "border-b-2 border-purple-500 text-purple-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    <CogIcon className="h-5 w-5 mr-1.5 text-purple-600" />
                    Управлява
                  </button>
                )}
                {hasExpertCategories && (
                  <button
                    onClick={() => setActiveCategoryRoleTab("expertIn")}
                    className={`hover:cursor-pointer flex-1 py-2 px-1 text-center text-sm font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center ${
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
