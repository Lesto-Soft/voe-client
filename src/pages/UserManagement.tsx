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
  useDeleteUser,
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
import ConfirmActionDialog from "../components/modals/ConfirmActionDialog";
import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";

// Page-Specific Imports
import UserStats from "../components/features/userManagement/UserStats";
import UserFilters from "../components/features/userManagement/UserFilters";
import UserTable from "../components/features/userManagement/UserTable";
import { useUserManagement } from "../hooks/useUserManagement"; // Adjust path
import { Role, User } from "../types/userManagementTypes"; // Adjust path
import { IUser } from "../db/interfaces";

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
    filterFinancial,
    setFilterFinancial,
    filterManager, // <-- ADDED: Get from hook
    setFilterManager, // <-- ADDED: Get from hook
    setFilterRoleIds,
    handlePageChange,
    handleItemsPerPageChange,
    handleRoleFilterToggle,
    currentQueryInput, // This now includes is_manager: true if filterManager is true
  } = useUserManagement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [showFilters, setShowFilters] = useState(true);

  // State for delete confirmation
  const [showUserDeleteConfirm, setShowUserDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");

  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // Fetch for the main UserTable (paginated and fully filtered including manager filter)
  const {
    users: usersDataForTable,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetAllUsers(currentQueryInput); // currentQueryInput from hook now includes manager filter

  // Count for the main UserTable (based on all current filters including manager filter)
  const {
    count: filteredUserCountForTableDisplay,
    loading: countLoading,
    error: countError,
    refetch: refetchUserCount,
  } = useCountUsers(currentQueryInput); // currentQueryInput from hook now includes manager filter

  const textAttributeFiltersOnlyInput = useMemo(() => {
    const {
      name,
      username,
      position,
      email,
      financial_approver,
      is_manager,
    } = // Added is_manager here
      currentQueryInput; // Use currentQueryInput as base to reflect all active filters for consistency if needed
    const filters: any = {};
    if (name) filters.name = name;
    if (username) filters.username = username;
    if (position) filters.position = position;
    if (email) filters.email = email;

    // These boolean filters are usually for the main query.
    // If usersForRoleCountsData needs to be filtered by these as well, include them.
    // Otherwise, if usersForRoleCountsData is ONLY for text-filtered counts before role selection,
    // you might not need financial_approver or is_manager here.
    // Based on your existing code, financial_approver IS included. So, is_manager should also be.
    if (typeof financial_approver === "boolean") {
      filters.financial_approver = financial_approver;
    }
    if (typeof is_manager === "boolean") {
      // <-- ADDED for consistency with financial_approver
      filters.is_manager = is_manager;
    }

    return filters;
  }, [
    currentQueryInput.name,
    currentQueryInput.username,
    currentQueryInput.position,
    currentQueryInput.email,
    currentQueryInput.financial_approver, // from currentQueryInput
    currentQueryInput.is_manager, // from currentQueryInput <-- ADDED
  ]);

  // Fetch ALL users (once) for client-side filtering for UserStats' dynamic role counts
  const {
    users: usersForRoleCountsData,
    loading: loadingUsersForRoleCounts,
    error: errorUsersForRoleCounts,
  } = useGetAllUsers(textAttributeFiltersOnlyInput); // This now potentially includes is_manager

  // Count of ALL users (for the "(от X)" part of "Общо Потребители")
  const {
    count: absoluteTotalUserCountValue,
    loading: absoluteTotalCountLoading,
    error: absoluteTotalCountError,
  } = useCountUsers({}); // This should remain unfiltered

  // Fetch all role definitions
  const {
    roles: rolesData,
    error: rolesErrorHook,
    loading: rolesLoadingHook,
    refetch: refetchRoles,
  } = useGetRoles();

  const usersForTable: IUser[] = usersDataForTable || [];
  const allUsersForDynamicRoleCount: IUser[] = usersForRoleCountsData || [];
  const roles: Role[] = rolesData?.getAllLeanRoles || [];

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

  const dynamicRoleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    roles.forEach((role) => {
      counts[role._id] = 0;
    });
    if (allUsersForDynamicRoleCount.length === 0 || roles.length === 0)
      return counts;

    allUsersForDynamicRoleCount.forEach((user) => {
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
  const {
    deleteUser,
    loading: deleteUserLoading,
    error: deleteUserError,
  } = useDeleteUser();

  const openCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };
  const openEditModal = (userToEdit: IUser) => {
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
    // formData now includes financial_approver from CreateUserForm
    // It does NOT include manager status directly unless you add a field for it in CreateUserForm
    // Manager status is derived from managed_categories.length > 0
    // If you need to set managed_categories during user creation/update, that field should be in CreateUserForm
    const finalInput: Partial<CreateUserInput | UpdateUserInput> = {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      position: formData.position,
      role: formData.role,
      financial_approver: formData.financial_approver,
      // managed_categories should be handled by CreateUserForm if it's editable there
      ...(formData.managed_categories && {
        managed_categories: formData.managed_categories,
      }),
      ...(formData.password && { password: formData.password }),
      ...(avatarData !== undefined && { avatar: avatarData }),
    };

    if (editingUserId) {
      Object.keys(finalInput).forEach((key) => {
        if (finalInput[key as keyof typeof finalInput] === undefined)
          delete finalInput[key as keyof typeof finalInput];
      });
      finalInput.financial_approver = formData.financial_approver;
    } else {
      finalInput.financial_approver = formData.financial_approver || false;
    }

    const context = editingUser ? "редактиране" : "създаване";
    try {
      let successMessage = "";
      if (editingUserId) {
        await updateUser(editingUserId, finalInput as UpdateUserInput);
        successMessage = "Потребителят е редактиран успешно!";
      } else {
        await createUser(finalInput as CreateUserInput);
        successMessage = "Потребителят е създаден успешно!";
      }
      await Promise.all([
        refetchUsers(),
        refetchUserCount(),
        refetchRoles ? refetchRoles() : Promise.resolve(),
      ]);
      setAvatarVersion(Date.now());
      closeModal();

      setSuccessModalMessage(successMessage);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error(`Error during user ${context}:`, err);
      const graphQLError = err.graphQLErrors?.[0]?.message;
      const networkError = err.networkError?.message;
      const message =
        graphQLError || networkError || err.message || "Неизвестна грешка";
      alert(`Грешка при ${context}: ${message}`);
    }
  };

  const triggerDeleteUser = (user: IUser) => {
    setUserToDelete(user);
    setShowUserDeleteConfirm(true);
  };

  const handleConfirmUserDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete._id);
      setShowUserDeleteConfirm(false);
      setUserToDelete(null);
      await Promise.all([refetchUsers(), refetchUserCount()]);
      if (refetchRoles) refetchRoles();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setShowUserDeleteConfirm(false);
      setUserToDelete(null);
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

  const isLoadingUserStatsOverallCounts =
    countLoading || absoluteTotalCountLoading;

  const isLoadingUserStatsRoleDefinitionsAndCounts =
    rolesLoadingHook || loadingUsersForRoleCounts || isDynamicRoleDataStale;

  const criticalPageError =
    rolesErrorHook ||
    absoluteTotalCountError ||
    errorUsersForRoleCounts ||
    usersError ||
    countError ||
    deleteUserError;

  if (
    criticalPageError &&
    !isLoadingTableData &&
    !isLoadingUserStatsOverallCounts &&
    !isLoadingUserStatsRoleDefinitionsAndCounts &&
    !deleteUserLoading
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
          absoluteTotalUserCount={absoluteTotalUserCountValue}
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
            className="w-full sm:w-[280px] flex flex-shrink-0 justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer active:bg-green-700 active:shadow-inner disabled:cursor-not-allowed"
            disabled={createLoading || updateLoading}
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
          filterFinancial={filterFinancial}
          setFilterFinancial={setFilterFinancial}
          filterManager={filterManager} // <-- Pass prop
          setFilterManager={setFilterManager} // <-- Pass prop
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
        onDeleteUser={triggerDeleteUser}
        serverBaseUrl={serverBaseUrl}
        avatarVersion={avatarVersion}
        currentQueryInput={currentQueryInput} // This now includes manager filter implicitly
        createLoading={createLoading}
        updateLoading={updateLoading}
        deleteUserLoading={deleteUserLoading}
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
            // If you want to edit managed_categories in the form, pass it to/from CreateUserForm
          />
        )}
      </CreateUserModal>

      <ConfirmActionDialog
        isOpen={showUserDeleteConfirm}
        onOpenChange={setShowUserDeleteConfirm}
        onConfirm={handleConfirmUserDelete}
        title="Потвърди изтриването на потребител"
        description={
          userToDelete
            ? `Сигурни ли сте, че искате да изтриете потребител "${userToDelete.name}" (${userToDelete.username})? Тази операция е необратима.`
            : "Сигурни ли сте, че искате да изтриете този потребител? Тази операция е необратима."
        }
        confirmButtonText="Изтрий потребител"
        isDestructiveAction={true}
      />

      <SuccessConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successModalMessage}
      />
    </div>
  );
};

export default UserManagement;
