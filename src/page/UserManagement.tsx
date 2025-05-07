import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";

// GraphQL Hooks & Types
import {
  useGetAllUsers,
  useCountUsers,
  useCreateUser,
  useUpdateUser,
} from "../graphql/hooks/user";
import {
  AttachmentInput,
  CreateUserInput,
  UpdateUserInput,
} from "../graphql/mutation/user";
import { useGetRoles } from "../graphql/hooks/role";

// Shared Components
import CreateUserModal from "../components/modals/CreateUserModal";
import CreateUserForm from "../components/forms/CreateUserForm";

// Page-Specific Imports
import UserStats from "../components/features/userManagement/UserStats";
import UserFilters from "../components/features/userManagement/UserFilters";
import UserTable from "../components/features/userManagement/UserTable";
import { useUserManagement } from "./hooks/useUserManagement";
import { Role, User } from "./types/userManagementTypes";
import LoadingModal from "../components/modals/LoadingModal";

const UserManagementPage: React.FC = () => {
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
    users,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetAllUsers(currentQueryInput);
  const {
    count: totalUserCount,
    loading: countLoading,
    error: countError,
    refetch: refetchUserCount,
  } = useCountUsers(currentQueryInput);
  const {
    roles: rolesData,
    error: rolesError,
    loading: rolesLoading,
    refetch: refetchRoles,
  } = useGetRoles();
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
      console.error(
        `Error during user ${editingUserId ? "update" : "create"}:`,
        err
      );
      const graphQLError = err.graphQLErrors?.[0]?.message;
      const networkError = err.networkError?.message;
      alert(
        `Грешка при ${editingUserId ? "редактиране" : "създаване"}: ${
          graphQLError || networkError || err.message || "Неизвестна грешка"
        }`
      );
    }
  };

  // Combined loading/error for page/table
  const isLoadingPageData = usersLoading || countLoading;
  const pageDataError = usersError || countError;

  // Initial Page Load Check (Roles are essential)
  if (rolesLoading)
    return <LoadingModal message="Зареждане на страницата..." />;
  if (rolesError)
    return (
      <div className="p-6 text-red-600 text-center">
        Грешка при зареждане на роли: {rolesError.message}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <UserStats
          totalUserCount={totalUserCount ?? 0}
          roles={roles}
          filterRoleIds={filterRoleIds}
          handleRoleFilterToggle={handleRoleFilterToggle}
          onShowAllUsers={() => setFilterRoleIds([])}
        />

        <div className="mb-6 flex flex-col sm:flex-row justify-end items-center gap-2">
          <button
            className="flex items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-gray-500 text-white hover:bg-gray-600 hover:cursor-pointer"
            title={showFilters ? "Скрий филтри" : "Покажи филтри"}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <ChevronUpIcon className="h-5 w-5 mr-1" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 mr-1" />
            )}{" "}
            Филтри
          </button>
          <button
            onClick={openCreateModal}
            className="flex flex-shrink-0 items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer active:bg-green-700 active:shadow-inner disabled:cursor-not-allowed"
            disabled={
              createLoading || updateLoading || usersLoading || countLoading
            }
          >
            <PlusIconSolid className="h-5 w-5 mr-1" /> Създай Потребител
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showFilters ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
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
        users={users || []} // Adjust based on actual return structure of useGetAllUsers
        isLoadingUsers={isLoadingPageData}
        usersError={pageDataError}
        totalUserCount={totalUserCount ?? 0}
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
            Грешка при запис: {createError?.message || updateError?.message}
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
            rolesLoading={rolesLoading}
            rolesError={rolesError}
          />
        )}
      </CreateUserModal>
    </div>
  );
};

export default UserManagementPage;
