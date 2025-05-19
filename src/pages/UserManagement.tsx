// src/page/UserManagement.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";

// GraphQL Hooks & Types
import {
  useGetAllUsers,
  useCountUsers,
  useCreateUser,
  useUpdateUser,
} from "../graphql/hooks/user"; // Adjust path
import {
  AttachmentInput,
  CreateUserInput,
  UpdateUserInput,
} from "../graphql/mutation/user"; // Adjust path
import { useGetRoles } from "../graphql/hooks/role"; // Adjust path

// Shared Components
import CreateUserModal from "../components/modals/CreateUserModal"; // Adjust path
import CreateUserForm from "../components/forms/CreateUserForm"; // Adjust path
import LoadingModal from "../components/modals/LoadingModal"; // Adjust path

// Page-Specific Imports
import UserStats from "../components/features/userManagement/UserStats";
import UserFilters from "../components/features/userManagement/UserFilters";
import UserTable from "../components/features/userManagement/UserTable";
import { useUserManagement } from "../hooks/useUserManagement"; // Adjust path
import { Role, User } from "../types/userManagementTypes"; // Adjust path

const UserManagement: React.FC = () => {
  const {
    currentPage,
    itemsPerPage,
    filterName,
    setFilterName,
    filterUsername,
    setFilterUsername,
    filterPosition,
    setFilterPosition,
    filterEmail,
    setFilterEmail,
    filterRoleIds,
    setFilterRoleIds,
    handlePageChange,
    handleItemsPerPageChange,
    handleRoleFilterToggle,
    currentQueryInput,
  } = useUserManagement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [showFilters, setShowFilters] = useState(true);

  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // Fetch for the main UserTable (paginated and fully filtered)
  const {
    users: usersDataForTable,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetAllUsers(currentQueryInput);

  // Count for the main UserTable (based on all current filters)
  const {
    count: filteredUserCountForTableDisplay,
    loading: countLoading,
    error: countError,
    refetch: refetchUserCount,
  } = useCountUsers(currentQueryInput);

  const textAttributeFiltersOnlyInput = useMemo(() => {
    const { name, username, position, email } = currentQueryInput;
    const filters: any = {};
    if (name) filters.name = name;
    if (username) filters.username = username;
    if (position) filters.position = position;
    if (email) filters.email = email;
    return filters;
  }, [
    currentQueryInput.name,
    currentQueryInput.username,
    currentQueryInput.position,
    currentQueryInput.email,
  ]);

  // Fetch ALL users (once) for client-side filtering for UserStats' dynamic role counts
  const {
    users: usersForRoleCountsData,
    loading: loadingUsersForRoleCounts,
    error: errorUsersForRoleCounts,
  } = useGetAllUsers(textAttributeFiltersOnlyInput);

  // Count of ALL users (for the "(от X)" part of "Общо Потребители")
  const {
    count: absoluteTotalUserCountValue, // Renamed to avoid conflict with other absoluteTotalUserCount variable if any
    loading: absoluteTotalCountLoading,
    error: absoluteTotalCountError,
  } = useCountUsers({});

  // Fetch all role definitions
  const {
    roles: rolesData,
    error: rolesErrorHook,
    loading: rolesLoadingHook,
    refetch: refetchRoles,
  } = useGetRoles();

  const usersForTable: User[] = usersDataForTable || [];
  const allUsersForDynamicRoleCount: User[] = usersForRoleCountsData || []; // Use data from the correct fetch
  const roles: Role[] = rolesData?.getAllLeanRoles || [];

  // --- State to track if text filters changed, making dynamicRoleCounts need recalculation/show skeleton ---

  const [isDynamicRoleDataStale, setIsDynamicRoleDataStale] = useState(false);
  const prevTextAttributeFiltersRef = useRef(textAttributeFiltersOnlyInput);

  useEffect(() => {
    if (
      JSON.stringify(prevTextAttributeFiltersRef.current) !==
      JSON.stringify(textAttributeFiltersOnlyInput)
    ) {
      setIsDynamicRoleDataStale(true);

      prevTextAttributeFiltersRef.current = textAttributeFiltersOnlyInput;
    }
  }, [textAttributeFiltersOnlyInput]);

  useEffect(() => {
    if (isDynamicRoleDataStale && !loadingUsersForRoleCounts) {
      setIsDynamicRoleDataStale(false);
    }
  }, [isDynamicRoleDataStale, loadingUsersForRoleCounts]);

  // Calculate dynamic role counts based on client-filtering absoluteTotalUsersData
  const dynamicRoleCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    roles.forEach((role) => {
      counts[role._id] = 0;
    });

    if (allUsersForDynamicRoleCount.length === 0 || roles.length === 0)
      return counts;

    allUsersForDynamicRoleCount.forEach((user) => {
      // Iterate over already filtered users

      const userRoleId =
        typeof user.role === "string" ? user.role : user.role?._id;

      if (userRoleId && counts.hasOwnProperty(userRoleId)) {
        counts[userRoleId]++;
      }
    });

    return counts;
  }, [allUsersForDynamicRoleCount, roles]);

  const {
    createUser,
    loading: createLoading,
    error: createError,
  } = useCreateUser();
  const {
    updateUser,
    loading: updateLoading,
    error: updateError,
  } = useUpdateUser();

  const openCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };
  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleFormSubmit = async (
    formData: any,
    editingUserId: string | null,
    avatarData: AttachmentInput | null | undefined
  ) => {
    const finalInput: Partial<CreateUserInput | UpdateUserInput> = {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      position: formData.position,
      role: formData.role, // This should be the roleId string from CreateUserForm
      ...(formData.password && { password: formData.password }),
      ...(avatarData !== undefined && { avatar: avatarData }),
    };

    if (editingUserId) {
      Object.keys(finalInput).forEach((key) => {
        if (finalInput[key as keyof typeof finalInput] === undefined)
          delete finalInput[key as keyof typeof finalInput];
      });
    }
    const context = editingUser ? "редактиране" : "създаване";
    try {
      if (editingUserId) {
        await updateUser(editingUserId, finalInput as UpdateUserInput);
      } else {
        await createUser(finalInput as CreateUserInput);
      }
      await Promise.all([
        refetchUsers(),
        refetchUserCount(),
        refetchRoles ? refetchRoles() : Promise.resolve(),
      ]);
      setAvatarVersion(Date.now());
      closeModal();
    } catch (err: any) {
      console.error(`Error during user ${context}:`, err);
      const graphQLError = err.graphQLErrors?.[0]?.message;
      const networkError = err.networkError?.message;
      const message =
        graphQLError || networkError || err.message || "Неизвестна грешка";
      alert(`Грешка при ${context}: ${message}`);
    }
  };

  const isLoadingTableData = usersLoading || countLoading;
  const tableDataError = usersError || countError;

  const hasActiveTextFilters = useMemo(
    () =>
      !!(
        currentQueryInput.name ||
        currentQueryInput.username ||
        currentQueryInput.position ||
        currentQueryInput.email
      ),

    [
      currentQueryInput.name,
      currentQueryInput.username,
      currentQueryInput.position,
      currentQueryInput.email,
    ]
  );

  // Loading state for the "Общо Потребители" card's numbers
  const isLoadingUserStatsOverallCounts =
    countLoading || absoluteTotalCountLoading;

  // Loading state for role definitions OR if dynamic role data is recalculating due to text filter changes
  const isLoadingUserStatsRoleDefinitionsAndCounts =
    rolesLoadingHook || loadingUsersForRoleCounts || isDynamicRoleDataStale;

  // Initial Page Load Check: if any essential data for stats is still loading
  if (
    //rolesLoadingHook ||
    absoluteTotalCountLoading //||
    //loadingUsersForRoleCounts
  ) {
    return <LoadingModal message={"Зареждане на страницата..."} />;
  }

  // Handle critical errors that prevent page rendering
  const criticalPageError =
    rolesErrorHook ||
    absoluteTotalCountError ||
    errorUsersForRoleCounts ||
    usersError ||
    countError;

  if (
    criticalPageError &&
    !isLoadingTableData &&
    !isLoadingUserStatsOverallCounts &&
    !isLoadingUserStatsRoleDefinitionsAndCounts
  ) {
    return (
      <div className="p-6 text-red-600 text-center">
        Грешка при зареждане на данни: {criticalPageError.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <UserStats
          filteredUserCount={filteredUserCountForTableDisplay ?? 0}
          absoluteTotalUserCount={absoluteTotalUserCountValue} // Use the count from useCountUsers({})
          hasActiveTextFilters={hasActiveTextFilters}
          roles={roles}
          filterRoleIds={filterRoleIds}
          handleRoleFilterToggle={handleRoleFilterToggle}
          onShowAllUsers={() => setFilterRoleIds([])}
          isLoadingOverallCounts={isLoadingUserStatsOverallCounts}
          isLoadingRoleDefinitions={isLoadingUserStatsRoleDefinitionsAndCounts}
          dynamicRoleCounts={dynamicRoleCounts}
        />
        <div className="flex flex-col sm:flex-row gap-2 items-center md:items-start flex-shrink-0 mt-4 md:mt-0">
          <button
            className="w-full sm:w-auto flex justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-gray-500 text-white hover:bg-gray-600 hover:cursor-pointer"
            title={showFilters ? "Скрий филтри" : "Покажи филтри"}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <ChevronUpIcon className="h-5 w-5 mr-1" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 mr-1" />
            )}
            Филтри
          </button>
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto flex flex-shrink-0 justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer active:bg-green-700 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              createLoading || updateLoading //|| isLoadingTableData ||
              // isLoadingUserStatsOverallCounts || // Disable if any part of stats is loading
              // isLoadingUserStatsRoleDefinitionsAndCounts
            }
          >
            <PlusIconSolid className="h-5 w-5 mr-1" />
            Създай Потребител
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showFilters ? "max-h-screen opacity-100 mb-6" : "max-h-0 opacity-0"
        }`}
      >
        <UserFilters
          filterName={filterName}
          setFilterName={setFilterName}
          filterUsername={filterUsername}
          setFilterUsername={setFilterUsername}
          filterPosition={filterPosition}
          setFilterPosition={setFilterPosition}
          filterEmail={filterEmail}
          setFilterEmail={setFilterEmail}
        />
      </div>

      <UserTable
        users={usersForTable}
        isLoadingUsers={isLoadingTableData}
        usersError={tableDataError}
        totalUserCount={filteredUserCountForTableDisplay ?? 0}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onEditUser={openEditModal}
        serverBaseUrl={serverBaseUrl}
        avatarVersion={avatarVersion}
        currentQueryInput={currentQueryInput}
        createLoading={createLoading}
        updateLoading={updateLoading}
      />

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? "Редактирай потребител" : "Създай нов потребител"}
      >
        {(createLoading || updateLoading) && (
          <div className="p-4 text-center">Изпращане...</div>
        )}
        {(createError || updateError) && !(createLoading || updateLoading) && (
          <div className="p-4 mb-4 text-center text-red-600 bg-red-100 rounded-md">
            Грешка при запис:{" "}
            {createError?.message ||
              updateError?.message ||
              "Неизвестна грешка"}
          </div>
        )}
        {!(createLoading || updateLoading) && (
          <CreateUserForm
            key={editingUser ? editingUser._id : "create-new-user"}
            onSubmit={handleFormSubmit}
            onClose={closeModal}
            initialData={editingUser}
            submitButtonText={editingUser ? "Запази" : "Създай"}
            roles={roles}
            rolesLoading={rolesLoadingHook}
            rolesError={rolesErrorHook}
            // serverBaseUrl prop is needed by useCreateUserFormState, ensure CreateUserForm receives it.
            // Your CreateUserForm already passes it down if it takes it as a prop.
          />
        )}
      </CreateUserModal>
    </div>
  );
};

export default UserManagement;
