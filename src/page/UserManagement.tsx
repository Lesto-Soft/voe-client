// src/page/UserManagement.tsx (Or UserManagementPage.tsx)
import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
// Removed i18n import: import { useTranslation } from 'react-i18next';

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
import UserStats from "../components/features/userManagement/UserStats"; // Import UserStats
import UserFilters from "../components/features/userManagement/UserFilters"; // Adjust path
import UserTable from "../components/features/userManagement/UserTable"; // Adjust path
import { useUserManagement } from "./hooks/useUserManagement"; // Adjust path
import { Role, User } from "./types/userManagementTypes"; // Adjust path

const UserManagement: React.FC = () => {
  // Renamed component if desired
  // Removed: const { t } = useTranslation();

  // State & Logic Hook
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [showFilters, setShowFilters] = useState(true);

  // Environment Variables
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // GraphQL Data Fetching
  const {
    users: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetAllUsers(currentQueryInput);
  const {
    count: filteredUserCount,
    loading: countLoading,
    error: countError,
    refetch: refetchUserCount,
  } = useCountUsers(currentQueryInput);
  const {
    count: absoluteTotalUserCount,
    loading: absoluteTotalLoading,
    error: absoluteTotalError,
  } = useCountUsers({});
  const {
    roles: rolesData,
    error: rolesErrorHook,
    loading: rolesLoadingHook,
    refetch: refetchRoles,
  } = useGetRoles();

  const users: User[] = usersData || [];
  const roles: Role[] = rolesData?.getAllLeanRoles || [];

  // GraphQL Mutations
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

  // Modal Controls
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

  // Form Submission Logic
  const handleFormSubmit = async (
    formData: any,
    editingUserId: string | null,
    avatarData: AttachmentInput | null | undefined
  ) => {
    const finalInput: CreateUserInput | UpdateUserInput = {
      ...formData,
      ...(avatarData !== undefined && { avatar: avatarData }),
    };
    const context = editingUser ? "редактиране" : "създаване"; // Hardcoded context
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

  // Combined loading/error for table data
  const isLoadingTableData = usersLoading || countLoading;
  const tableDataError = usersError || countError;

  // Determine if any text filter is active
  const hasActiveTextFilters = useMemo(() => {
    return !!(
      currentQueryInput.name ||
      currentQueryInput.username ||
      currentQueryInput.position ||
      currentQueryInput.email
    );
  }, [currentQueryInput]);

  // Initial Page Load Check (Wait for roles and absolute total)
  // TODO: Add skeleton for for the stat cards instead of a loading modal
  if (rolesLoadingHook || absoluteTotalLoading) {
    return <LoadingModal message={"Зареждане на страницата..."} />;
  }

  // Check for critical errors
  if (rolesErrorHook || absoluteTotalError) {
    return (
      <div className="p-6 text-red-600 text-center">
        {rolesErrorHook
          ? `Грешка при зареждане на роли: ${rolesErrorHook.message}`
          : ""}
        {absoluteTotalError
          ? ` Грешка при зареждане на общ брой потребители: ${absoluteTotalError.message}`
          : ""}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Combined Stats and Actions Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <UserStats
          filteredUserCount={filteredUserCount ?? 0}
          absoluteTotalUserCount={absoluteTotalUserCount}
          hasActiveTextFilters={hasActiveTextFilters}
          roles={roles}
          filterRoleIds={filterRoleIds}
          handleRoleFilterToggle={handleRoleFilterToggle}
          onShowAllUsers={() => setFilterRoleIds([])}
        />
        {/* Action Buttons */}
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
            className="w-full sm:w-auto flex flex-shrink-0 justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer active:bg-green-700 active:shadow-inner disabled:cursor-not-allowed"
            disabled={
              createLoading ||
              updateLoading ||
              usersLoading ||
              countLoading ||
              rolesLoadingHook ||
              absoluteTotalLoading
            }
          >
            <PlusIconSolid className="h-5 w-5 mr-1" />
            Създай Потребител
          </button>
        </div>
      </div>

      {/* Filter Section - Conditionally Rendered */}
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
        users={users || []}
        isLoadingUsers={isLoadingTableData}
        usersError={tableDataError}
        totalUserCount={filteredUserCount ?? 0}
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
