// src/page/UserManagement.tsx
import React, { useState, useMemo, useEffect } from "react";
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
import { useUserManagement } from "./hooks/useUserManagement"; // Adjust path
import { Role, User } from "./types/userManagementTypes"; // Adjust path

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
    filterRoleIds, // This is the role filter for the main table
    setFilterRoleIds,
    handlePageChange,
    handleItemsPerPageChange,
    handleRoleFilterToggle,
    currentQueryInput, // Contains all filters including pagination and roleIds for the main table
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

  // Fetch ALL users (once) for client-side filtering for UserStats' dynamic role counts
  const {
    users: absoluteTotalUsersData, // This will contain ALL users
    loading: absoluteTotalUsersLoading,
    error: absoluteTotalUsersError,
  } = useGetAllUsers({}); // Empty filter object fetches all users

  // Fetch all role definitions
  const {
    roles: rolesData,
    error: rolesErrorHook,
    loading: rolesLoadingHook,
    refetch: refetchRoles,
  } = useGetRoles();

  const usersForTable: User[] = usersDataForTable || [];
  const allUsersForStatsCalculation: User[] = absoluteTotalUsersData || []; // Use a distinct name
  const roles: Role[] = rolesData?.getAllLeanRoles || [];

  // Calculate dynamic role counts based on client-filtering absoluteTotalUsersData
  // These counts respect text/attribute filters but ignore pagination and the main role filter
  const dynamicRoleCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    // Initialize counts for all defined roles to 0
    roles.forEach((role) => {
      counts[role._id] = 0;
    });

    if (allUsersForStatsCalculation.length === 0 || roles.length === 0) {
      return counts; // Return early if no users or no roles to process
    }

    // Get the current text/attribute filters (excluding roleIds, page, itemsPerPage)
    // currentQueryInput from useUserManagement hook already contains these
    const nameFilter = currentQueryInput.name?.toLowerCase();
    const usernameFilter = currentQueryInput.username?.toLowerCase();
    const positionFilter = currentQueryInput.position?.toLowerCase();
    const emailFilter = currentQueryInput.email?.toLowerCase();

    allUsersForStatsCalculation.forEach((user) => {
      // Apply text/attribute filters client-side
      const nameMatch =
        !nameFilter ||
        (user.name && user.name.toLowerCase().includes(nameFilter));
      const usernameMatch =
        !usernameFilter ||
        (user.username && user.username.toLowerCase().includes(usernameFilter));
      const positionMatch =
        !positionFilter ||
        (user.position && user.position.toLowerCase().includes(positionFilter));
      const emailMatch =
        !emailFilter ||
        (user.email && user.email.toLowerCase().includes(emailFilter));

      if (nameMatch && usernameMatch && positionMatch && emailMatch) {
        // Determine the user's role ID
        const userRoleId =
          typeof user.role === "string" ? user.role : user.role?._id;
        if (userRoleId && counts.hasOwnProperty(userRoleId)) {
          counts[userRoleId]++;
        }
      }
    });
    return counts;
  }, [
    allUsersForStatsCalculation,
    roles,
    currentQueryInput.name,
    currentQueryInput.username,
    currentQueryInput.position,
    currentQueryInput.email,
  ]);

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
      email: formData.email, // Assuming empty string is handled by validation/backend if it's optional
      position: formData.position,
      role: formData.roleId,
      ...(formData.password && { password: formData.password }),
      ...(avatarData !== undefined && { avatar: avatarData }),
    };

    if (editingUserId) {
      Object.keys(finalInput).forEach((key) => {
        const K = key as keyof typeof finalInput;
        if (finalInput[K] === undefined) {
          delete finalInput[K];
        }
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

  const hasActiveTextFilters = useMemo(() => {
    return !!(
      currentQueryInput.name ||
      currentQueryInput.username ||
      currentQueryInput.position ||
      currentQueryInput.email
    );
  }, [
    currentQueryInput.name,
    currentQueryInput.username,
    currentQueryInput.position,
    currentQueryInput.email,
  ]);

  // isLoading for UserStats includes roles loading, the full user list loading (for dynamic counts), and general count loading
  const isLoadingUserStats =
    rolesLoadingHook || absoluteTotalUsersLoading || countLoading;

  // Initial Page Load Check: Display modal if critical data for stats is still loading
  if (rolesLoadingHook || absoluteTotalUsersLoading) {
    return <LoadingModal message={"Зареждане на страницата..."} />;
  }

  // Handle critical errors that prevent page rendering
  const criticalPageError =
    rolesErrorHook || absoluteTotalUsersError || usersError || countError; // Include table data errors
  if (criticalPageError && !isLoadingTableData && !isLoadingUserStats) {
    // Only show if not already covered by a skeleton/loading state
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
          absoluteTotalUserCount={absoluteTotalUsersData.length} // This is the count from useCountUsers({})
          hasActiveTextFilters={hasActiveTextFilters}
          roles={roles}
          filterRoleIds={filterRoleIds}
          handleRoleFilterToggle={handleRoleFilterToggle}
          onShowAllUsers={() => setFilterRoleIds([])}
          isLoading={isLoadingUserStats}
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
              createLoading ||
              updateLoading ||
              isLoadingTableData || // if table data is still loading (users or its count)
              isLoadingUserStats // if stats data is still loading
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
          />
        )}
      </CreateUserModal>
    </div>
  );
};

export default UserManagement;
