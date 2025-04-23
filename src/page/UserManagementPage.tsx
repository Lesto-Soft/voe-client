import React, { useState, useEffect } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
import {
  useGetUsers,
  useCreateUser,
  useUpdateUser,
  useCountUsers,
} from "../graphql/hooks/user";
import {
  AttachmentInput,
  CreateUserInput,
  UpdateUserInput,
} from "../graphql/mutation/user";
import CreateUserModal from "../components/modals/CreateUserModal";
import CreateUserForm from "../components/forms/CreateUserForm";
import { useGetRoles } from "../graphql/hooks/role";
import StatCard from "../components/cards/StatCard";
import UserAvatar from "../components/cards/UserAvatar"; // Import the UserAvatar component
import { Link, useSearchParams } from "react-router";

// Interfaces matching GraphQL Schema and component needs
export interface Role {
  __typename?: "Role";
  _id: string;
  name: string;
  users?: { _id: string }[]; // Or the full User type if needed/queried
}

interface User {
  _id: string;
  username: string;
  name: string;
  position: string;
  email: string;
  role: Role | null;
  avatar?: string | null; // Relative path string from DB (e.g., /avatars/...)
}

const UserManagementPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchQuery] = useState("");

  // Access environment variables using Vite's standard method
  // Ensure VITE_API_URL is defined in your .env file (e.g., VITE_API_URL=http://localhost:4000)
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";
  console.log("Server Base URL:", serverBaseUrl);

  // GraphQL Hooks
  const {
    users: usersData,
    error: usersError,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useGetUsers(searchQuery, itemsPerPage, currentPage);
  const {
    count: userCount,
    error: userCountError,
    loading: userCountLoading,
    refetch: refetchUserCount,
  } = useCountUsers();
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
    roles: rolesData,
    error: rolesError,
    loading: rolesLoading,
    refetch: refetchRoles,
  } = useGetRoles();

  // Process Data
  const users: User[] = usersData?.getAllUsers || [];
  console.log("Users Data Received:", users);
  const roles: Role[] = rolesData?.getAllLeanRoles || [];

  const roleColors = [
    "text-gray-400", // normal
    "text-blue-400", // expert
    "text-blue-700", // admin
    "text-red-300", // no longer employed
  ];

  // Utility Function
  const capitalizeFirstLetter = (str: string | undefined | null): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

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
    formData: any, // Contains fields like name, email, role, potentially password
    editingUserId: string | null,
    avatarData: AttachmentInput | null | undefined // Contains {filename, file} or null or undefined
  ) => {
    const finalInput: CreateUserInput | UpdateUserInput = {
      ...formData,
      // Conditionally add the 'avatar' field based on avatarData state
      ...(avatarData !== undefined && { avatar: avatarData }),
    };

    try {
      if (editingUserId) {
        // Call the updateUser function from the hook
        await updateUser(editingUserId, finalInput as UpdateUserInput);
      } else {
        // Call the createUser function from the hook
        await createUser(finalInput as CreateUserInput);
      }
      // Refetch necessary data after successful mutation
      await refetchUsers();
      await refetchRoles();
      if (!editingUserId) await refetchUserCount();
      closeModal(); // Close modal on success
    } catch (err: any) {
      console.error("Error submitting form via GQL hook:", err);
      const graphQLError = err.graphQLErrors?.[0]?.message;
      const networkError = err.networkError?.message;
      const generalMessage = err.message;
      // Display error to the user (consider a more user-friendly notification system)
      alert(
        `Грешка при ${editingUserId ? "редактиране" : "създаване"}: ${
          graphQLError || networkError || generalMessage || "Неизвестна грешка"
        }`
      );
    }
  };

  // Loading / Error States for page data
  const isLoading = usersLoading || userCountLoading || rolesLoading;
  const dataError = usersError || userCountError || rolesError;
  if (isLoading && !isModalOpen)
    return <div className="p-6 text-center">Зареждане на данни...</div>;
  if (dataError)
    return (
      <div className="p-6 text-red-600">
        Грешка при зареждане: {dataError.message}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Stats and Actions Section */}
      <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <StatCard
            amount={userCount ?? 0}
            title="Общо потребители"
            iconColor="text-gray-400"
            onClick={() => {}}
          />
          {roles.map((role, index) => {
            const colorIndex = index % roleColors.length;
            const dynamicColor = roleColors[colorIndex];

            return (
              <StatCard
                key={role._id}
                amount={role.users?.length || 0}
                title={capitalizeFirstLetter(role.name)}
                iconColor={dynamicColor}
                onClick={() => {}}
              />
            );
          })}
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-gray-50 hover:shadow-md active:bg-gray-100 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed" // Added transition, enhanced hover, active styles, and disabled styles
          disabled={createLoading || updateLoading} // Disable button during mutation
        >
          <PlusIconSolid className="h-5 w-5" />
          Създай Потребител
        </button>
      </section>

      {/* Users Table Section */}
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-700 text-xs uppercase text-gray-300">
              <tr>
                <th
                  scope="col"
                  className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
                >
                  Аватар
                </th>
                <th
                  scope="col"
                  className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
                >
                  Потребителско име
                </th>
                <th
                  scope="col"
                  className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
                >
                  Име
                </th>
                <th
                  scope="col"
                  className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
                >
                  Позиция
                </th>
                <th
                  scope="col"
                  className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
                >
                  Имейл
                </th>
                <th
                  scope="col"
                  className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
                >
                  Роля
                </th>
                <th
                  scope="col"
                  className="border-l border-gray-600 px-4 py-3 font-medium tracking-wider lg:px-6"
                >
                  Редактирай
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {users.map((user) => {
                // Construct the full image URL ONLY if user.avatar path exists
                const imageUrl =
                  user.avatar && user._id
                    ? `${serverBaseUrl}/static/avatars/${user._id}/${user.avatar}` // Corrected syntax
                    : null;
                console.log(
                  `User ${user._id} | Avatar Path: ${user.avatar} | Full URL: ${imageUrl}`
                ); // <-- ADD THIS LOG

                return (
                  <tr
                    key={user._id}
                    className="border-b border-gray-200 bg-white hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 lg:px-6">
                      <UserAvatar
                        name={user.name || user.username || "User"} // Provide name for initials fallback
                        imageUrl={imageUrl} // Pass the constructed URL or null
                        size={32} // Corresponds to h-8 w-8 classes
                      />
                    </td>
                    <td className="px-4 py-3 lg:px-6">
                      <Link
                        to={`/user-data/${user._id}`} // Dynamic path
                        className="font-medium text-blue-600 hover:underline" // Keep styling
                      >
                        {user.username}
                      </Link>
                    </td>
                    <td className="px-4 py-3 lg:px-6">{user.name || "-"}</td>
                    <td className="px-4 py-3 lg:px-6">
                      {user.position || "-"}
                    </td>
                    <td className="px-4 py-3 lg:px-6">{user.email || "-"}</td>
                    <td className="px-4 py-3 lg:px-6">
                      {capitalizeFirstLetter(user.role?.name) || "-"}
                    </td>
                    <td className=" text-center">
                      <button
                        onClick={() => openEditModal(user)}
                        className="flex w-full items-center justify-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 hover:text-sky-800 active:bg-sky-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100" // <-- Updated classes
                        aria-label={`Редактирай ${user.username}`}
                        disabled={createLoading || updateLoading} // Disable edit during mutation
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Няма намерени потребители.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? "Редактирай потребител" : "Създай нов потребител"}
      >
        {/* Display loading/error specific to the mutation within the modal */}
        {(createLoading || updateLoading) && (
          <div className="p-4 text-center">Изпращане...</div>
        )}
        {(createError || updateError) && (
          <div className="p-4 text-center text-red-500">
            Грешка при запис: {createError?.message || updateError?.message}
          </div>
        )}

        {/* Render form only when NOT actively processing a mutation */}
        {!(createLoading || updateLoading) && (
          <CreateUserForm
            // Key prop helps ensure state resets properly in the form when switching between create/edit user
            key={editingUser ? editingUser._id : "create"}
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
