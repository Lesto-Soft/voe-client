// src/components/features/userManagement/UserTable.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router"; // Corrected import
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid"; // Or your preferred variant
import UserAvatar from "../../cards/UserAvatar"; // Adjust path
import UserTableSkeleton from "../../skeletons/UserTableSkeleton"; // Adjust path
import Pagination from "../../tables/Pagination"; // Adjust path
import { capitalizeFirstLetter } from "../../../utils/stringUtils"; // Adjust path
import { isNullOrEmptyArray } from "../../../utils/arrayUtils"; // Ensure this path is correct
import UserLink from "../../global/UserLink";
import { IMe, IUser } from "../../../db/interfaces";
import { useCurrentUser } from "../../../context/UserContext";
import { ROLES } from "../../../utils/GLOBAL_PARAMETERS";

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
  onDeleteUser: (user: IUser) => void; // New prop
  serverBaseUrl: string;
  avatarVersion: number;
  currentQueryInput: any; // Consider more specific type
  createLoading: boolean;
  updateLoading: boolean;
  deleteUserLoading?: boolean; // New prop
}

const MIN_SKELETON_TIME = 250;

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
  onDeleteUser, // Destructure new prop
  serverBaseUrl,
  avatarVersion,
  currentQueryInput,
  // createLoading,
  // updateLoading,
  // deleteUserLoading, // Destructure new prop
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

  const columnWidths = {
    avatar: "w-16", // approx 64px
    name: "w-1/6",
    username: "w-1/5",
    position: "w-1/5",
    email: "w-1/6",
    role: "w-1/10",
    edit: "w-1/10",
  };

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
      <section className="flex flex-col shadow-md rounded-lg overflow-hidden bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-500 sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  className={`${columnWidths.avatar} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide`}
                >
                  Аватар
                </th>
                <th
                  scope="col"
                  className={`${columnWidths.name} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Име
                </th>
                <th
                  scope="col"
                  className={`${columnWidths.username} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative whitespace-nowrap`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Потребителско име
                </th>
                <th
                  scope="col"
                  className={`${columnWidths.position} hidden md:table-cell px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Позиция
                </th>
                <th
                  scope="col"
                  className={`${columnWidths.email} hidden md:table-cell px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Имейл
                </th>
                <th
                  scope="col"
                  className={`${columnWidths.role} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Роля
                </th>
                <th
                  scope="col"
                  className={`${columnWidths.edit} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative`}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
              {users.map((user) => {
                const imageUrl =
                  user.avatar && user._id
                    ? `${serverBaseUrl}/static/avatars/${user._id}/${user.avatar}?v=${avatarVersion}`
                    : null;
                const isInactive = user.role?.name === "напуснал";
                let rowClasses =
                  "hover:bg-gray-100 transition-colors duration-150";
                const inactiveClasses =
                  "bg-gray-50 text-gray-400 hover:bg-gray-100";

                if (isInactive) {
                  rowClasses = inactiveClasses;
                }

                const canDeleteUser =
                  isNullOrEmptyArray(user.cases) &&
                  isNullOrEmptyArray(user.comments) &&
                  isNullOrEmptyArray(user.answers) &&
                  isNullOrEmptyArray(user.expert_categories) &&
                  isNullOrEmptyArray(user.managed_categories);

                return (
                  <tr key={user._id} className={rowClasses}>
                    <td
                      className={`${
                        columnWidths.avatar
                      } px-3 py-4 whitespace-nowrap flex justify-center items-center ${
                        isInactive ? "opacity-50" : ""
                      }`}
                    >
                      <UserAvatar
                        name={user.name || user.username || "U"}
                        imageUrl={imageUrl}
                        size={42}
                        enablePreview={true}
                      />
                    </td>
                    <td className={`${columnWidths.name} px-3 py-4 text-sm`}>
                      <div className="flex items-center justify-start flex-row">
                        <UserLink user={user} />
                      </div>
                    </td>
                    <td
                      className={`${columnWidths.username} px-3 py-4 whitespace-nowrap text-sm`}
                    >
                      {user.username || "-"}
                    </td>
                    <td
                      className={`${columnWidths.position} hidden md:table-cell px-3 py-4 whitespace-nowrap text-sm`}
                    >
                      {user.position || "-"}
                    </td>
                    <td
                      className={`${columnWidths.email} hidden md:table-cell px-3 py-4 whitespace-nowrap text-sm`}
                    >
                      {user.email || "-"}
                    </td>
                    <td
                      className={`${columnWidths.role} px-3 py-4 whitespace-nowrap text-sm`}
                    >
                      <div className="flex items-center justify-between w-full">
                        {" "}
                        {/* Main flex container for role name and badges block */}
                        {/* Role Name - takes available space on the left */}
                        <span
                          className={`${
                            isInactive ? "opacity-70" : ""
                          } truncate`}
                          // Adjust the max-width calculation based on the total width of the badges container
                          // Example: Each badge/placeholder is w-6 (1.5rem). space-x-1 is 0.25rem. Total ~3.25rem to 3.5rem.
                          style={{ maxWidth: "calc(100% - 3.5rem)" }}
                          title={capitalizeFirstLetter(user.role?.name) || "-"}
                        >
                          {capitalizeFirstLetter(user.role?.name) || "-"}
                        </span>
                        {/* Container for both badges - this group will be on the right */}
                        <div className="flex items-center flex-shrink-0 space-x-1">
                          {" "}
                          {/* flex-shrink-0 prevents this container from shrinking */}
                          {/* Financial Approver Badge or Placeholder */}
                          {user.financial_approver ? (
                            <span
                              className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded font-medium text-center align-middle w-6 h-5 ${
                                /* Fixed width and height */ ""
                              }
            ${
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
                            ></span> /* Placeholder with same dimensions */
                          )}
                          {/* Manager Badge or Placeholder */}
                          {user.managed_categories &&
                          user.managed_categories?.length > 0 ? (
                            <Link
                              to={`/category-management?page=1&itemsPerPage=10&managers=${user._id}`}
                              className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded font-medium text-center align-middle w-6 h-5 ${
                                /* Fixed width and height */ ""
                              }
            ${
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
                            ></span> /* Placeholder with same dimensions */
                          )}
                        </div>
                      </div>
                    </td>
                    <td
                      className={`${columnWidths.edit} px-3 py-4 whitespace-nowrap text-center`}
                    >
                      <div
                        className={`inline-flex items-center ${
                          canDeleteUser ? "space-x-1" : ""
                        }`}
                      >
                        <button
                          onClick={() => onEditUser(user)}
                          className={`${
                            isInactive ? "opacity-50" : "" // pointer-events-none" : ""
                          } ${
                            canDeleteUser ? "w-10" : "w-20"
                          } inline-flex justify-center items-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 hover:text-sky-800 active:bg-sky-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
                          aria-label={`Редактирай ${user.username}`}
                          title={`Редактирай ${user.username}`}
                          disabled={
                            currentUser?.role?._id !== ROLES.ADMIN &&
                            user.role?._id === ROLES.ADMIN
                          }
                          // disabled={
                          //   isInactive ||
                          //   createLoading ||
                          //   updateLoading ||
                          //   deleteUserLoading ||
                          //   isLoadingUsers
                          // }
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>

                        {canDeleteUser && (
                          <button
                            onClick={() => onDeleteUser(user)}
                            className={`${
                              isInactive ? "opacity-50" : "" // pointer-events-none" : ""
                            } w-10 inline-flex justify-center items-center rounded bg-red-100 p-1.5 text-red-700 border border-red-200 hover:border-red-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-red-200 hover:text-red-800 active:bg-red-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
                            aria-label={`Изтрий ${user.username}`}
                            title={`Изтрий ${user.username}`}
                            // disabled={
                            //   isInactive ||
                            //   createLoading ||
                            //   updateLoading ||
                            //   deleteUserLoading ||
                            //   isLoadingUsers
                            // }
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!isLoadingUsers && users.length === 0 && (
                <tr>
                  <td
                    colSpan={Object.keys(columnWidths).length}
                    className="px-3 py-10 text-center text-gray-500"
                  >
                    Няма намерени потребители
                    {Object.keys(currentQueryInput || {}).some((key) => {
                      if (key === "itemsPerPage" || key === "currentPage")
                        return false;
                      const value = currentQueryInput[key];
                      return Array.isArray(value) ? value.length > 0 : !!value;
                    })
                      ? " съответстващи на филтрите"
                      : ""}
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
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
