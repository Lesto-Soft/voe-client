import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";

// GraphQL Hooks & Types
import {
  useGetAllUsers,
  useCountUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../graphql/hooks/user"; // Adjust path
import { CreateUserInput, UpdateUserInput } from "../graphql/mutation/user"; // Adjust path
import { useGetRoles } from "../graphql/hooks/role"; // Adjust path

// Context & Interfaces
import { useCurrentUser } from "../context/UserContext"; // <-- NEW: Import current user hook
import { IMe, IUser } from "../db/interfaces"; // <-- NEW: Import IMe
import { Role } from "../types/userManagementTypes"; // Adjust path

// Shared Components
import UserModal from "../components/modals/UserModal"; // Using renamed modal
import UserForm from "../components/forms/UserForm"; // Using renamed form
import ConfirmActionDialog from "../components/modals/ConfirmActionDialog";
import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";

// Page-Specific Imports
import UserStats from "../components/features/userManagement/UserStats";
import UserFilters from "../components/features/userManagement/UserFilters";
import UserTable from "../components/features/userManagement/UserTable";
import { useUserManagement } from "../hooks/useUserManagement"; // Adjust path
import { ROLES } from "../utils/GLOBAL_PARAMETERS";

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
    filterManager,
    setFilterManager,
    setFilterRoleIds,
    handlePageChange,
    handleItemsPerPageChange,
    handleRoleFilterToggle,
    currentQueryInput,
  } = useUserManagement();

  const handleClearAllFilters = () => {
    setFilterName("");
    setFilterUsername("");
    setFilterPosition("");
    setFilterEmail("");
    setFilterRoleIds([]);
    setFilterFinancial(false);
    setFilterManager(false);
    handlePageChange(1);
  };

  // --- NEW: Get current user and determine if they are an admin ---
  const currentUser = useCurrentUser() as IMe | undefined;
  const isAdmin = currentUser?.role?._id === ROLES.ADMIN;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [showFilters, setShowFilters] = useState(true);
  const [showUserDeleteConfirm, setShowUserDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  const {
    users: usersDataForTable,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetAllUsers(currentQueryInput);

  const {
    count: filteredUserCountForTableDisplay,
    loading: countLoading,
    error: countError,
    refetch: refetchUserCount,
  } = useCountUsers(currentQueryInput);

  const textAttributeFiltersOnlyInput = useMemo(() => {
    const { name, username, position, email, financial_approver, is_manager } =
      currentQueryInput;
    const filters: any = {};
    if (name) filters.name = name;
    if (username) filters.username = username;
    if (position) filters.position = position;
    if (email) filters.email = email;
    if (typeof financial_approver === "boolean") {
      filters.financial_approver = financial_approver;
    }
    if (typeof is_manager === "boolean") {
      filters.is_manager = is_manager;
    }
    return filters;
  }, [
    currentQueryInput.name,
    currentQueryInput.username,
    currentQueryInput.position,
    currentQueryInput.email,
    currentQueryInput.financial_approver,
    currentQueryInput.is_manager,
  ]);

  const {
    users: usersForRoleCountsData,
    loading: loadingUsersForRoleCounts,
    error: errorUsersForRoleCounts,
    refetch: refetchUsersForRoleCounts,
  } = useGetAllUsers(textAttributeFiltersOnlyInput);

  const {
    count: absoluteTotalUserCountValue,
    loading: absoluteTotalCountLoading,
    error: absoluteTotalCountError,
  } = useCountUsers({});

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
    avatarData: File | null | undefined
  ) => {
    const finalInput: Partial<CreateUserInput | UpdateUserInput> = {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      position: formData.position,
      role: formData.role,
      financial_approver: formData.financial_approver,
      expert_categories: formData.expert_categories, // NEW
      managed_categories: formData.managed_categories, // NEW
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
        refetchUsersForRoleCounts(), // added since we can now change user.expert_categories / user.managed_categories through the UserForm
        refetchRoles ? refetchRoles() : Promise.resolve(),
      ]);
      // --- MODIFIED ORDER ---
      // 1. Close the form modal immediately
      closeModal();
      // 2. Show the success message immediately
      setSuccessModalMessage(successMessage);
      setIsSuccessModalOpen(true);
      // 3. Update avatar version and refetch data in the background
      setAvatarVersion(Date.now());
      refetchUsers();
      refetchUserCount();
      if (refetchRoles) refetchRoles();
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

  // calculate the count of misconfigured experts
  const misconfiguredExpertsCount = useMemo(() => {
    if (
      !allUsersForDynamicRoleCount ||
      allUsersForDynamicRoleCount.length === 0
    ) {
      return 0;
    }
    return allUsersForDynamicRoleCount.filter(
      (user) =>
        user.role?._id === ROLES.EXPERT &&
        (!user.expert_categories || user.expert_categories.length === 0) &&
        (!user.managed_categories || user.managed_categories.length === 0)
    ).length;
  }, [allUsersForDynamicRoleCount]);

  // functionality to re-show the banner
  // useEffect(() => {
  //   if (misconfiguredExpertsCount > 0) {
  //     setIsBannerVisible(true);
  //   }
  // }, [misconfiguredExpertsCount]);

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
    <div className="min-h-screen bg-gray-100 p-6">
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
          <div className="flex gap-2 w-full sm:w-auto">
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
              type="button"
              onClick={handleClearAllFilters}
              className="hover:cursor-pointer w-full sm:w-auto flex justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-btnRed text-white hover:bg-btnRedHover"
              title="Изчисти всички филтри"
            >
              <XMarkIcon className="h-5 w-5 mr-1" />
              Изчисти
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="sm:w-54 w-full flex flex-shrink-0 justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer active:bg-green-700 active:shadow-inner disabled:cursor-not-allowed"
              disabled={createLoading || updateLoading}
            >
              <PlusIconSolid className="h-5 w-5 mr-1" />
              Създай Потребител
            </button>
          )}
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
          filterManager={filterManager}
          setFilterManager={setFilterManager}
        />
      </div>

      {misconfiguredExpertsCount > 0 && (
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isBannerVisible ? "max-h-40 opacity-100 mb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg shadow flex items-center justify-between"
            role="alert"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
              <div>
                <p className="font-bold">Внимание</p>
                <p className="text-sm">
                  Има {misconfiguredExpertsCount} потребител
                  {misconfiguredExpertsCount === 1 ? "" : "и"} с роля 'Експерт',
                  на {misconfiguredExpertsCount === 1 ? "когото" : "които"} не
                  са зададени категории.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="p-1 rounded-md hover:bg-yellow-200 transition-colors cursor-pointer"
              aria-label="Скрий предупреждението"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

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
        currentQueryInput={currentQueryInput}
        createLoading={createLoading}
        updateLoading={updateLoading}
        deleteUserLoading={deleteUserLoading}
      />

      <UserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? "Редактирай потребител" : "Създай нов потребител"}
      >
        {(createLoading || updateLoading) && (
          <div className="p-4 text-center">Изпращане...</div>
        )}
        {(createError || updateError) && !(createLoading || updateLoading) && (
          <div className="p-4 mb-4 text-center text-red-600 bg-red-100 rounded-md">
            Грешка при запис:
            {createError?.message ||
              updateError?.message ||
              "Неизвестна грешка"}
          </div>
        )}
        {!(createLoading || updateLoading) && (
          <UserForm
            key={editingUser ? editingUser._id : "create-new-user"}
            onSubmit={handleFormSubmit}
            onClose={closeModal}
            initialData={editingUser}
            submitButtonText={editingUser ? "Запази" : "Създай"}
            roles={roles}
            rolesLoading={rolesLoadingHook}
            rolesError={rolesErrorHook}
            isAdmin={isAdmin} // we assume that whoever can see this page should have admin rights
            //isAdmin={isAdmin} // <-- MODIFIED: Pass the isAdmin flag
          />
        )}
      </UserModal>

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
