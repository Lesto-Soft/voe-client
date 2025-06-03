// src/components/features/userAnalytics/UserInformationPanel.tsx
import React from "react";
import { IUser, ICategory } from "../../../db/interfaces"; // Adjust path as needed
import UserAvatar from "../../../components/cards/UserAvatar"; // Adjust path as needed
import CategoryLink from "../../../components/global/CategoryLink"; // Adjust path as needed
import {
  UserCircleIcon,
  AtSymbolIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  AcademicCapIcon, // For expert categories
  CogIcon, // For managed categories (or another suitable icon)
  IdentificationIcon, // For User ID
} from "@heroicons/react/24/outline";

interface UserInformationPanelProps {
  user: IUser | undefined | null;
  isLoading?: boolean;
  serverBaseUrl: string; // For avatar URL construction
}

const UserInformationPanel: React.FC<UserInformationPanelProps> = ({
  user,
  isLoading,
  serverBaseUrl,
}) => {
  if (isLoading || !user) {
    // Basic Skeleton/Loading State for the panel
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            ))}
          </div>
          <hr className="my-4 border-gray-200" />
          <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </aside>
    );
  }

  const avatarUrl = user.avatar
    ? `${serverBaseUrl}/static/avatars/${user._id}/${user.avatar}`
    : undefined; // UserAvatar handles default

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

  return (
    <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
        {/* User Avatar and Name */}
        <div className="flex flex-col items-center text-center space-y-2">
          <UserAvatar name={user.name} imageUrl={avatarUrl} size={96} />{" "}
          {/* h-24 w-24 */}
          <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
          {user.username && (
            <p className="text-sm text-gray-500">@{user.username}</p>
          )}
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Contact and Role Info */}
        <div className="space-y-2.5">
          <InfoItem icon={IdentificationIcon} label="ID" value={user._id} />
          {user.email && (
            <InfoItem
              icon={AtSymbolIcon}
              label="Имейл"
              value={
                <a
                  href={`mailto:${user.email}`}
                  className="text-blue-600 hover:underline"
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
            value={user.role?.name || "N/A"}
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

        {/* Expert Categories */}
        {user.expert_categories && user.expert_categories.length > 0 && (
          <>
            <hr className="my-4 border-gray-200" />
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-400" />
                Експерт в категории:
              </h3>
              <ul className="space-y-1">
                {user.expert_categories.map((category: ICategory) => (
                  <li key={category._id} className="text-sm text-gray-700 pl-7">
                    <CategoryLink category={category} />
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Managed Categories */}
        {user.managed_categories && user.managed_categories.length > 0 && (
          <>
            <hr className="my-4 border-gray-200" />
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
                <CogIcon className="h-5 w-5 mr-2 text-gray-400" />
                Управлява категории:
              </h3>
              <ul className="space-y-1">
                {user.managed_categories.map((category: ICategory) => (
                  <li key={category._id} className="text-sm text-gray-700 pl-7">
                    <CategoryLink category={category} />
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default UserInformationPanel;
