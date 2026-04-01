// src/components/features/userManagement/UserTable.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import UserAvatar from "../../cards/UserAvatar";
import UserTableSkeleton from "../../skeletons/UserTableSkeleton";
import Pagination from "../../tables/Pagination";
import { capitalizeFirstLetter } from "../../../utils/stringUtils";
import { isNullOrEmptyArray } from "../../../utils/arrayUtils";
import UserLink from "../../global/links/UserLink";
import { IMe, IUser } from "../../../db/interfaces";
import { useCurrentUser } from "../../../context/UserContext";
import { ROLES } from "../../../utils/GLOBAL_PARAMETERS";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import HoverTooltip from "../../global/HoverTooltip";
import DataTable, { DataTableColumn } from "../../tables/DataTable";

interface UserTableProps {
  users: IUser[];
  isLoadingUsers: boolean;
  usersError?: any;
  totalUserCount: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  onEditUser: (user: IUser) => void;
  onDeleteUser: (user: IUser) => void;
  serverBaseUrl: string;
  avatarVersion: number;
  currentQueryInput: any;
  createLoading: boolean;
  updateLoading: boolean;
  deleteUserLoading?: boolean;
}

const MIN_SKELETON_TIME = 250;

const getUserStates = (user: IUser) => {
  const isMisconfiguredExpert =
    user.role?.name === "експерт" &&
    (!user.expert_categories || user.expert_categories.length === 0) &&
    (!user.managed_categories || user.managed_categories.length === 0);
  const isInactive = user.role?.name === "напуснал";
  return { isMisconfiguredExpert, isInactive };
};

const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoadingUsers,
  usersError,
  totalUserCount,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onEditUser,
  onDeleteUser,
  serverBaseUrl,
  avatarVersion,
  currentQueryInput,
}) => {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const skeletonTimerRef = useRef<number | null>(null);
  const currentUser = useCurrentUser() as IMe | undefined;

  useEffect(() => {
    if (isLoadingUsers) {
      setShowSkeleton(true);
      if (skeletonTimerRef.current !== null)
        clearTimeout(skeletonTimerRef.current);
      skeletonTimerRef.current = null;
    } else {
      skeletonTimerRef.current = window.setTimeout(() => {
        setShowSkeleton(false);
        skeletonTimerRef.current = null;
      }, MIN_SKELETON_TIME);
    }
    return () => {
      if (skeletonTimerRef.current !== null)
        clearTimeout(skeletonTimerRef.current);
    };
  }, [isLoadingUsers]);

  const columns: DataTableColumn<IUser>[] = [
    {
      key: "avatar",
      header: "Аватар",
      width: "w-16",
      cellClassName: (user) => {
        const { isMisconfiguredExpert, isInactive } = getUserStates(user);
        let classes = "whitespace-nowrap flex justify-center items-center";
        if (isMisconfiguredExpert) classes += " shadow-[inset_4px_0_0_#EAB308]";
        else classes += " shadow-[inset_4px_0_0_transparent]";
        if (isInactive) classes += " opacity-50";
        return classes;
      },
      render: (user) => {
        const imageUrl =
          user.avatar && user._id
            ? `${serverBaseUrl}/static/avatars/${user._id}/${user.avatar}?v=${avatarVersion}`
            : null;
        return (
          <UserAvatar
            name={user.name || user.username || "U"}
            imageUrl={imageUrl}
            size={42}
            enablePreview={true}
          />
        );
      },
    },
    {
      key: "name",
      header: "Име",
      width: "w-1/6",
      cellClassName: "text-sm",
      render: (user) => (
        <div className="flex items-center justify-start flex-row">
          <UserLink user={user} />
        </div>
      ),
    },
    {
      key: "username",
      header: "Потребителско име",
      width: "w-1/5",
      headerClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap text-sm",
      render: (user) => <>{user.username || "-"}</>,
    },
    {
      key: "position",
      header: "Позиция",
      width: "w-1/5",
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell whitespace-nowrap text-sm",
      render: (user) => <>{user.position || "-"}</>,
    },
    {
      key: "email",
      header: "Имейл",
      width: "w-1/6",
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell whitespace-nowrap text-sm",
      render: (user) => <>{user.email || "-"}</>,
    },
    {
      key: "role",
      header: "Роля",
      width: "w-1/10",
      cellClassName: "whitespace-nowrap text-sm",
      render: (user) => {
        const { isMisconfiguredExpert, isInactive } = getUserStates(user);
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center truncate">
              <span
                className={`${isInactive ? "opacity-70" : ""} truncate`}
                title={capitalizeFirstLetter(user.role?.name) || "-"}
              >
                {capitalizeFirstLetter(user.role?.name) || "-"}
              </span>
              {isMisconfiguredExpert && (
                <HoverTooltip
                  content="Експерт без зададени категории"
                  delayDuration={100}
                >
                  <span className="ml-2 flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                  </span>
                </HoverTooltip>
              )}
            </div>
            <div className="flex items-center flex-shrink-0 space-x-1">
              {user.financial_approver ? (
                <span
                  className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded font-medium text-center align-middle w-6 h-5 ${
                    isInactive
                      ? "bg-green-50 text-green-500 border border-green-100 opacity-75"
                      : "bg-green-100 text-green-700 border border-green-200"
                  }`}
                  title="Финансов одобрител"
                >
                  $
                </span>
              ) : (
                <span
                  className="inline-block w-6 h-5"
                  aria-hidden="true"
                ></span>
              )}
              {user.managed_categories &&
              user.managed_categories?.length > 0 ? (
                <Link
                  to={`/category-management?page=1&itemsPerPage=10&managers=${user._id}`}
                  className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded font-medium text-center align-middle w-6 h-5 ${
                    isInactive
                      ? "bg-blue-50 text-blue-500 hover:bg-blue-100 border border-blue-100 opacity-75"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                  }`}
                  title="Менажира категории"
                >
                  M
                </Link>
              ) : (
                <span
                  className="inline-block w-6 h-5"
                  aria-hidden="true"
                ></span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Действия",
      width: "w-1/10",
      cellClassName: "whitespace-nowrap text-center",
      render: (user) => {
        const { isInactive } = getUserStates(user);
        const canDeleteUser =
          isNullOrEmptyArray(user.cases) &&
          isNullOrEmptyArray(user.comments) &&
          isNullOrEmptyArray(user.answers) &&
          isNullOrEmptyArray(user.expert_categories) &&
          isNullOrEmptyArray(user.managed_categories) &&
          !user.financial_approver;
        return (
          <div
            className={`inline-flex items-center ${
              canDeleteUser ? "space-x-1" : ""
            }`}
          >
            <button
              onClick={() => onEditUser(user)}
              className={`${
                isInactive ? "opacity-50" : ""
              } ${
                canDeleteUser ? "w-10" : "w-20"
              } inline-flex justify-center items-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 hover:text-sky-800 active:bg-sky-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
              aria-label={`Редактирай ${user.username}`}
              title={`Редактирай ${user.username}`}
              disabled={
                currentUser?.role?._id !== ROLES.ADMIN &&
                user.role?._id === ROLES.ADMIN
              }
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>

            {canDeleteUser && (
              <button
                onClick={() => onDeleteUser(user)}
                className={`${
                  isInactive ? "opacity-50" : ""
                } w-10 inline-flex justify-center items-center rounded bg-red-100 p-1.5 text-red-700 border border-red-200 hover:border-red-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-red-200 hover:text-red-800 active:bg-red-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
                aria-label={`Изтрий ${user.username}`}
                title={`Изтрий ${user.username}`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  if (showSkeleton && isLoadingUsers)
    return <UserTableSkeleton rows={itemsPerPage} />;
  if (!isLoadingUsers && usersError)
    return (
      <div className="p-6 text-red-600 bg-white rounded-lg shadow-md text-center">
        Грешка при зареждане: {usersError.message || "Неизвестна грешка."}
      </div>
    );

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        rowKey={(user) => user._id}
        rowClassName={(user) => {
          const { isMisconfiguredExpert, isInactive } = getUserStates(user);
          if (isMisconfiguredExpert)
            return "transition-colors duration-150 bg-yellow-50 hover:bg-yellow-100";
          if (isInactive)
            return "bg-gray-50 text-gray-400 hover:bg-gray-100";
          return "transition-colors duration-150 hover:bg-gray-100";
        }}
        emptyMessage={`Няма намерени потребители${
          Object.keys(currentQueryInput || {}).some((key) => {
            if (key === "itemsPerPage" || key === "currentPage") return false;
            const value = currentQueryInput[key];
            return Array.isArray(value) ? value.length > 0 : !!value;
          })
            ? " съответстващи на филтрите"
            : ""
        }.`}
      />
      {!isLoadingUsers && totalUserCount > 0 && (
        <Pagination
          totalPages={Math.ceil(totalUserCount / itemsPerPage)}
          totalCount={totalUserCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </>
  );
};

export default UserTable;
