// src/pages/UserManagementPage.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
import { Link, useLocation, useNavigate } from "react-router"; // Use react-router-dom
import {
  useGetUsers,
  useCreateUser,
  useUpdateUser,
  useCountUsers,
} from "../graphql/hooks/user"; // Adjust path as needed
import {
  AttachmentInput,
  CreateUserInput,
  UpdateUserInput,
} from "../graphql/mutation/user"; // Adjust path as needed
import CreateUserModal from "../components/modals/CreateUserModal"; // Adjust path as needed
import CreateUserForm from "../components/forms/CreateUserForm"; // Adjust path as needed
import { useGetRoles } from "../graphql/hooks/role"; // Adjust path as needed
import StatCard from "../components/cards/StatCard"; // Adjust path as needed
import UserAvatar from "../components/cards/UserAvatar"; // Adjust path as needed
import UserTableSkeleton from "../components/skeletons/UserTableSkeleton"; // Import skeleton - Adjust path as needed
import Pagination from "../components/tables/Pagination"; // Import pagination - Adjust path as needed

// --- Interfaces ---
// Ensure these match your GraphQL schema and component needs
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

// --- Helper Functions for URL Params ---
function getPaginationParams(params: URLSearchParams) {
  const page = Number(params.get("page")) || 1;
  // Default to 10 items per page if not specified or invalid
  const perPageParam = Number(params.get("perPage"));
  const perPage = [10, 25, 50].includes(perPageParam) ? perPageParam : 10;
  return { page, perPage };
}

function setPaginationParams(
  params: URLSearchParams,
  page: number,
  perPage: number
) {
  params.set("page", String(page));
  params.set("perPage", String(perPage));
}
// --- End Helper Functions ---

const UserManagementPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [searchQuery] = useState(""); // Placeholder for potential future search implementation

  // Pagination and URL State
  const searchParams = new URLSearchParams(location.search);
  const { page: initialPage, perPage: initialPerPage } =
    getPaginationParams(searchParams);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialPerPage);

  // Skeleton State
  const [showSkeleton, setShowSkeleton] = useState(true); // Start potentially visible
  const skeletonTimerRef = useRef<number | null>(null);
  const MIN_SKELETON_TIME = 250; // Min time (ms) to show skeleton to prevent flickering

  // Environment Variables
  // Ensure VITE_API_URL is defined in your .env file (e.g., VITE_API_URL=http://localhost:4000)
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // --- GraphQL Hooks ---
  const {
    users: usersData,
    error: usersError,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useGetUsers(searchQuery, itemsPerPage, currentPage - 1); // Assuming 0-based index for hook

  const {
    count: userCountData,
    error: userCountError,
    loading: userCountLoading,
    refetch: refetchUserCount,
  } = useCountUsers(); // Add searchQuery here if count should be filtered

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

  // --- Process Data ---
  const users: User[] = usersData?.getAllUsers || [];
  const roles: Role[] = rolesData?.getAllLeanRoles || [];
  const totalUserCount = userCountData || 0;

  // --- Style Definitions ---
  const roleColors = [
    "text-gray-400", // normal
    "text-blue-400", // expert
    "text-blue-700", // admin
    "text-red-300", // no longer employed
  ];

  // --- Utility Functions ---
  const capitalizeFirstLetter = (str: string | undefined | null): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // --- Modal Controls ---
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

  // --- Form Submission Logic ---
  const handleFormSubmit = async (
    formData: any, // Contains fields like name, email, role, potentially password
    editingUserId: string | null,
    avatarData: AttachmentInput | null | undefined // Contains {filename, file} or null or undefined
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
      // Refetch data relevant to the current view
      await refetchUsers();
      await refetchRoles(); // Roles might change if user counts per role are displayed
      await refetchUserCount(); // Total count might change on creation
      setAvatarVersion(Date.now()); // Force avatar refresh
      closeModal(); // Close modal on success
    } catch (err: any) {
      console.error("Error submitting form via GQL hook:", err);
      const graphQLError = err.graphQLErrors?.[0]?.message;
      const networkError = err.networkError?.message;
      const generalMessage = err.message;
      // Consider using a more user-friendly notification system than alert
      alert(
        `Грешка при ${editingUserId ? "редактиране" : "създаване"}: ${
          graphQLError || networkError || generalMessage || "Неизвестна грешка"
        }`
      );
    }
  };

  // --- Skeleton Visibility Effect ---
  useEffect(() => {
    if (usersLoading) {
      setShowSkeleton(true); // Show skeleton immediately when loading starts
      // Clear any pending timer to hide the skeleton prematurely
      if (skeletonTimerRef.current !== null) {
        clearTimeout(skeletonTimerRef.current);
        skeletonTimerRef.current = null;
      }
    } else {
      // When loading finishes, set a timer to ensure skeleton shows for min time
      skeletonTimerRef.current = window.setTimeout(() => {
        setShowSkeleton(false);
        skeletonTimerRef.current = null;
      }, MIN_SKELETON_TIME);
    }

    // Cleanup timer on unmount or if loading starts again before timer finishes
    return () => {
      if (skeletonTimerRef.current !== null) {
        clearTimeout(skeletonTimerRef.current);
      }
    };
  }, [usersLoading]);

  // --- URL Sync Effect (Pagination) ---
  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const { page: urlPage, perPage: urlPerPage } =
      getPaginationParams(currentParams);

    // Update URL if state differs from URL params or if params are missing/invalid
    if (currentPage !== urlPage || itemsPerPage !== urlPerPage) {
      const params = new URLSearchParams(location.search); // Get fresh params
      setPaginationParams(params, currentPage, itemsPerPage);
      // Add other persistent params here if needed (e.g., search, filters)
      // params.set('search', searchQuery);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
    // Intentionally excluding location.search to prevent loops when *only* URL changes
    // We only want this effect to run when state (currentPage, itemsPerPage) changes.
  }, [currentPage, itemsPerPage, location.pathname, navigate]);

  // --- Pagination Handlers ---
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Optional: Scroll to top of the table/page
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    // The useGetUsers hook should refetch automatically due to currentPage changing
  }, []); // No dependencies needed if it only sets state

  const handleItemsPerPageChange = useCallback((size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1); // Go back to page 1 when changing items per page
    // The useGetUsers hook should refetch automatically
  }, []); // No dependencies needed if it only sets state

  // --- Initial Loading/Error States for Page ---
  // Check for errors that prevent the page structure (stats, roles) from loading
  const criticalError = userCountError || rolesError;
  // Check if essential non-table data is loading
  const isPageLoading = userCountLoading || rolesLoading;

  if (isPageLoading) {
    // Can show a simple page loader, stats/roles will appear when loaded
    return <div className="p-6 text-center">Зареждане на страницата...</div>;
  }
  if (criticalError) {
    return (
      <div className="p-6 text-red-600">
        Грешка при зареждане на данни за страницата: {criticalError.message}
      </div>
    );
  }

  // --- Render Component ---
  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Stats and Actions Section */}
      <section className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Stat Cards */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start">
          <StatCard
            amount={totalUserCount ?? 0} // Use total count here
            title="Общо потребители"
            iconColor="text-gray-700"
            onClick={() => {}} // Add functionality if needed
            className="w-full md:w-auto"
          />
          <div className="grid grid-cols-2 gap-4 md:flex md:flex-wrap md:gap-4">
            {roles.map((role, index) => {
              const colorIndex = index % roleColors.length;
              const dynamicColor = roleColors[colorIndex];
              return (
                <StatCard
                  key={role._id}
                  amount={role.users?.length || 0} // Assumes roles hook fetches user counts
                  title={capitalizeFirstLetter(role.name)}
                  iconColor={dynamicColor}
                  onClick={() => {}} // Add functionality if needed
                />
              );
            })}
          </div>
        </div>
        {/* Create User Button */}
        <button
          onClick={openCreateModal}
          className="flex flex-shrink-0 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-gray-50 hover:shadow-md active:bg-gray-100 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={createLoading || updateLoading || usersLoading} // Disable during mutations or table load
        >
          <PlusIconSolid className="h-5 w-5" />
          Създай Потребител
        </button>
      </section>

      {/* Conditional Rendering: Skeleton or Table */}
      {showSkeleton ? (
        <UserTableSkeleton rows={itemsPerPage} />
      ) : usersError ? (
        <div className="p-6 text-red-600 bg-white rounded-lg shadow-md text-center">
          Грешка при зареждане на потребители: {usersError.message}
        </div>
      ) : (
        // Updated Table Section - mimicking CaseTable styling
        <section className="flex flex-col shadow-md rounded-lg overflow-hidden bg-white border border-gray-200">
          <div className="overflow-x-auto">
            {/* Use min-w-full and divide-y */}
            <table className="min-w-full divide-y divide-gray-200">
              {/* Updated thead: sticky, bg-gray-500 */}
              <thead className="bg-gray-500 sticky top-0 z-10">
                <tr>
                  {/* Updated th styling: padding, text, no border-l */}
                  <th
                    scope="col"
                    className="px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide"
                  >
                    Аватар
                  </th>
                  {/* Add separator span to subsequent headers */}
                  <th
                    scope="col"
                    className="px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide relative"
                  >
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"
                      aria-hidden="true"
                    ></span>{" "}
                    {/* Vertical separator */}
                    Потребителско име
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide relative"
                  >
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"
                      aria-hidden="true"
                    ></span>
                    Име
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide relative"
                  >
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"
                      aria-hidden="true"
                    ></span>
                    Позиция
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide relative"
                  >
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"
                      aria-hidden="true"
                    ></span>
                    Имейл
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide relative"
                  >
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"
                      aria-hidden="true"
                    ></span>
                    Роля
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative" // Centered text
                  >
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"
                      aria-hidden="true"
                    ></span>
                    Редактирай
                  </th>
                </tr>
              </thead>
              {/* Updated tbody: add divide-y */}
              <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
                {users.map((user) => {
                  const imageUrl =
                    user.avatar && user._id
                      ? `${serverBaseUrl}/static/avatars/${user._id}/${user.avatar}?v=${avatarVersion}`
                      : null;
                  return (
                    // Removed border-b from tr (handled by tbody divide-y)
                    <tr key={user._id} className="hover:bg-gray-100">
                      {/* Updated td padding: px-3 py-4 */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <UserAvatar
                          name={user.name || user.username || "User"}
                          imageUrl={imageUrl}
                          size={32}
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap font-medium">
                        {" "}
                        {/* Added font-medium */}
                        <Link
                          to={`/user-data/${user._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {user.username}
                        </Link>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {user.name || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {user.position || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {user.email || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {capitalizeFirstLetter(user.role?.name) || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => openEditModal(user)}
                          className="inline-flex w-30 justify-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 hover:text-sky-800 active:bg-sky-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                          aria-label={`Редактирай ${user.username}`}
                          disabled={
                            createLoading || updateLoading || usersLoading
                          }
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {/* No changes needed for "No users found" row */}
                {!usersLoading && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-10 text-center text-gray-500"
                    >
                      {" "}
                      {/* Adjusted padding */}
                      Няма намерени потребители.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pagination Component */}
      {/* Render pagination only when not showing skeleton and there are users to paginate */}
      {!showSkeleton && totalUserCount > 0 && (
        <Pagination
          totalPages={Math.ceil(totalUserCount / itemsPerPage)}
          totalCount={totalUserCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          // Pass 't' function if Pagination component uses i18n for labels
          // t={t}
        />
      )}

      {/* Modal for Create/Edit User */}
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
            // Key prop ensures form state resets correctly when switching between create/edit
            key={editingUser ? editingUser._id : "create"}
            onSubmit={handleFormSubmit}
            onClose={closeModal}
            initialData={editingUser}
            submitButtonText={editingUser ? "Запази" : "Създай"}
            roles={roles} // Pass fetched roles
            rolesLoading={rolesLoading}
            rolesError={rolesError}
          />
        )}
      </CreateUserModal>
    </div>
  );
};

export default UserManagementPage;
