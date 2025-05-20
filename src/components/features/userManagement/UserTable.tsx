// src/components/features/userManagement/UserTable.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import UserAvatar from "../../cards/UserAvatar"; // Adjust path
import UserTableSkeleton from "../../skeletons/UserTableSkeleton"; // Adjust path
import Pagination from "../../tables/Pagination"; // Adjust path
import { User } from "../../../types/userManagementTypes"; // Adjust path
import { capitalizeFirstLetter } from "../../../utils/stringUtils"; // Adjust path
import { isNullOrEmptyArray } from "../../../utils/arrayUtils";

interface UserTableProps {
  users: User[];
  isLoadingUsers: boolean;
  usersError?: any;
  totalUserCount: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  onEditUser: (user: User) => void;
  serverBaseUrl: string;
  avatarVersion: number;
  currentQueryInput: any;
  createLoading: boolean;
  updateLoading: boolean;
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
  serverBaseUrl,
  avatarVersion,
  currentQueryInput,
  createLoading,
  updateLoading,
}) => {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const skeletonTimerRef = useRef<number | null>(null);

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
    avatar: "w-16",
    name: "w-1/6",
    username: "w-1/5",
    position: "w-1/5",
    email: "w-1/6",
    role: "w-1/10",
    edit: "w-1/10",
  };

  if (showSkeleton) return <UserTableSkeleton rows={itemsPerPage} />;
  if (usersError)
    return (
      <div className="p-6 text-red-600 bg-white rounded-lg shadow-md text-center">
        Грешка при зареждане: {usersError.message}
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
                  Редактирай
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
              {users.map((user) => {
                const imageUrl =
                  user.avatar && user._id
                    ? `${serverBaseUrl}/static/avatars/${user._id}/${user.avatar}?v=${avatarVersion}`
                    : null;

                // Determine if the user is inactive
                const isInactive = user.role?.name === "напуснал";

                // Define base row classes
                let rowClasses = "hover:bg-gray-100";
                // Define inactive specific classes
                const inactiveClasses = "bg-gray-50 text-gray-300 cursor-text"; // Example inactive style

                if (isInactive) {
                  rowClasses = inactiveClasses;
                }

                return (
                  <tr key={user._id} className={rowClasses}>
                    <td
                      className={`${
                        columnWidths.avatar
                      } px-3 py-4 whitespace-nowrap flex justify-center items-center${
                        isInactive ? "opacity-50" : ""
                      }`}
                    >
                      {" "}
                      <UserAvatar
                        name={user.name || user.username || "U"}
                        imageUrl={imageUrl}
                        size={42}
                      />{" "}
                    </td>
                    <td className={`${columnWidths.name} px-3 py-4 text-sm`}>
                      <div className="flex items-center justify-left flex-row">
                        <Link
                          to={`/user-data/${user._id}`}
                          className={`max-w-75 inline-block px-2 py-0.5 rounded-md font-medium transition-colors duration-150 ease-in-out text-left hover:cursor-pointer ${
                            isInactive
                              ? "bg-purple-50 text-purple-400 hover:bg-purple-100 border border-purple-100 opacity-75"
                              : "bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200"
                          } truncate`}
                          title={user.name}
                        >
                          {user.name}
                        </Link>
                        {user.financial_approver ? (
                          <span
                            className={`ml-1 inline-block px-1.5 py-0.5 text-xs rounded font-medium transition-colors duration-150 ease-in-out text-center align-middle ${
                              // Adjusted base classes for a smaller badge
                              isInactive
                                ? "bg-green-50 text-green-500 border border-green-100 opacity-75" // Muted green for inactive state
                                : "bg-green-100 text-green-700  border border-green-200" // Standard green for active state
                            }`}
                            title="Financial Approver"
                          >
                            $
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                    </td>

                    <td
                      className={`${columnWidths.username} px-3 py-4 whitespace-nowrap`}
                    >
                      {user.username || "-"}
                    </td>
                    <td
                      className={`${columnWidths.position} hidden md:table-cell px-3 py-4 whitespace-nowrap`}
                    >
                      {user.position || "-"}
                    </td>
                    <td
                      className={`${columnWidths.email} hidden md:table-cell px-3 py-4 whitespace-nowrap`}
                    >
                      {user.email || "-"}
                    </td>
                    <td
                      className={`${columnWidths.role} px-3 py-4 whitespace-nowrap`}
                    >
                      {capitalizeFirstLetter(user.role?.name) || "-"}
                      {user.managed_categories?.length > 0 ? (
                        <Link
                          to={`/category-management?page=1&itemsPerPage=10&managers=${user._id}`}
                          className={`ml-1 inline-block px-1.5 py-0.1 text-xs rounded font-medium transition-colors duration-150 ease-in-out text-center align-middle ${
                            isInactive
                              ? "bg-blue-50 text-blue-500 hover:bg-blue-100 border border-blue-100 opacity-75"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                          }`}
                          title="Manager"
                        >
                          M
                        </Link>
                      ) : (
                        ""
                      )}
                    </td>
                    <td
                      className={`${columnWidths.edit} px-3 py-4 whitespace-nowrap text-center`}
                    >
                      {(() => {
                        // Define the condition for showing the Delete button
                        const canDeleteUser =
                          isNullOrEmptyArray(user.cases) &&
                          isNullOrEmptyArray(user.comments) &&
                          isNullOrEmptyArray(user.answers) &&
                          isNullOrEmptyArray(user.expert_categories) &&
                          isNullOrEmptyArray(user.managed_categories);

                        return (
                          <div
                            className={`inline-flex items-center ${
                              canDeleteUser ? "space-x-1" : "" // Add space only if delete button will be present
                            }`}
                          >
                            <button
                              onClick={() => onEditUser(user)}
                              className={`${
                                isInactive ? "opacity-50" : "" // Apply if relevant for user rows
                              } ${
                                canDeleteUser
                                  ? "w-10" // Shrunken width when delete button is present
                                  : "w-20" // Default "quite large" width
                              } inline-flex justify-center items-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 hover:text-sky-800 active:bg-sky-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
                              aria-label={`Редактирай ${user.username}`}
                              title={`Редактирай ${user.username}`}
                              disabled={
                                createLoading || updateLoading || isLoadingUsers
                              }
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>

                            {canDeleteUser && (
                              <button
                                onClick={() => {
                                  alert("TBD");
                                }} //onDeleteUser(user)} // You'll need an onDeleteUser function
                                className={`${
                                  isInactive ? "opacity-50" : "" // Apply if relevant for user rows
                                } w-10 inline-flex justify-center items-center rounded bg-red-100 p-1.5 text-red-700 border border-red-200 hover:border-red-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-red-200 hover:text-red-800 active:bg-red-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100`}
                                aria-label={`Изтрий ${user.username}`}
                                title={`Изтрий ${user.username}`}
                                disabled={
                                  createLoading ||
                                  updateLoading ||
                                  isLoadingUsers // Consider a separate deleteLoading state
                                }
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        );
                      })()}
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
