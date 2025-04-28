import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  PencilSquareIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline"; // Added Chevron icons
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
import { Link, useLocation, useNavigate } from "react-router";
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
import UserTableSkeleton from "../components/skeletons/UserTableSkeleton"; // Adjust path as needed
import Pagination from "../components/tables/Pagination"; // Adjust path as needed
import UserSearchBar from "../components/tables/UserSearchBar"; // Import when created

// --- Interfaces ---
export interface Role {
  __typename?: "Role";
  _id: string;
  name: string;
  users?: { _id: string }[];
}

interface User {
  _id: string;
  username: string;
  name: string;
  position: string;
  email: string;
  role: Role | null;
  avatar?: string | null;
}

// --- useDebounce Hook ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Helper Functions for URL Params ---
function getUrlParams(params: URLSearchParams) {
  const page = Number(params.get("page")) || 1;
  const perPageParam = Number(params.get("perPage"));
  const perPage = [10, 25, 50].includes(perPageParam) ? perPageParam : 10;
  const name = params.get("name") || "";
  const username = params.get("username") || "";
  const position = params.get("position") || "";
  const email = params.get("email") || "";
  const roleIdsParam = params.get("roleIds");
  const roleIds = roleIdsParam ? roleIdsParam.split(",").filter(Boolean) : [];

  return { page, perPage, name, username, position, email, roleIds };
}

function setUrlParams(params: URLSearchParams, state: any) {
  // Pagination
  params.set("page", String(state.currentPage));
  params.set("perPage", String(state.itemsPerPage));

  // Filters
  state.filterName
    ? params.set("name", state.filterName)
    : params.delete("name");
  state.filterUsername
    ? params.set("username", state.filterUsername)
    : params.delete("username");
  state.filterPosition
    ? params.set("position", state.filterPosition)
    : params.delete("position");
  state.filterEmail
    ? params.set("email", state.filterEmail)
    : params.delete("email");

  if (state.filterRoleIds && state.filterRoleIds.length > 0) {
    params.set("roleIds", state.filterRoleIds.join(","));
  } else {
    params.delete("roleIds");
  }
}
// --- End Helper Functions ---

const UserManagementPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [showSkeleton, setShowSkeleton] = useState(true);
  const skeletonTimerRef = useRef<number | null>(null);
  const MIN_SKELETON_TIME = 250;
  const [showFilters, setShowFilters] = useState(true);

  // Parse initial state from URL
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const initialStateFromUrl = useMemo(
    () => getUrlParams(searchParams),
    [searchParams]
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState(initialStateFromUrl.page);
  const [itemsPerPage, setItemsPerPage] = useState(initialStateFromUrl.perPage);

  // Filter State
  const [filterName, setFilterName] = useState(initialStateFromUrl.name);
  const [filterUsername, setFilterUsername] = useState(
    initialStateFromUrl.username
  );
  const [filterPosition, setFilterPosition] = useState(
    initialStateFromUrl.position
  );
  const [filterEmail, setFilterEmail] = useState(initialStateFromUrl.email);
  const [filterRoleIds, setFilterRoleIds] = useState<string[]>(
    initialStateFromUrl.roleIds
  );

  // Debounced Filter State
  const debouncedFilterName = useDebounce(filterName, 500);
  const debouncedFilterUsername = useDebounce(filterUsername, 500);
  const debouncedFilterPosition = useDebounce(filterPosition, 500);
  const debouncedFilterEmail = useDebounce(filterEmail, 500);

  // Environment Variables
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // --- GraphQL Hooks ---
  // Build variables object for the hooks based on current filters/pagination
  // Memoize to prevent unnecessary refetches if underlying values haven't changed
  const queryVariables = useMemo(() => {
    // Offset calculation for pagination
    const offset = (currentPage - 1) * itemsPerPage;

    // Construct filter object - only include non-empty filters
    const filters: any = {};
    if (debouncedFilterName) filters.name = debouncedFilterName;
    if (debouncedFilterUsername) filters.username = debouncedFilterUsername;
    if (debouncedFilterPosition) filters.position = debouncedFilterPosition;
    if (debouncedFilterEmail) filters.email = debouncedFilterEmail;
    if (filterRoleIds.length > 0) filters.roleIds = filterRoleIds;

    // Structure depends on how your hook/backend expects variables
    return {
      filters: Object.keys(filters).length > 0 ? filters : undefined, // Pass filters only if any exist
      limit: itemsPerPage,
      offset: offset,
    };
  }, [
    currentPage,
    itemsPerPage,
    debouncedFilterName,
    debouncedFilterUsername,
    debouncedFilterPosition,
    debouncedFilterEmail,
    filterRoleIds,
  ]);

  // --- IMPORTANT ---
  // Modify useGetUsers and useCountUsers hooks and your backend GQL API
  // to accept filter variables structured like 'queryVariables.filters'.
  // The hooks should then pass these variables to the actual GraphQL query.

  const {
    users: usersData,
    error: usersError,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useGetUsers(queryVariables); // Pass constructed variables

  const {
    count: userCountData,
    error: userCountError,
    loading: userCountLoading,
    refetch: refetchUserCount,
  } = useCountUsers(
    queryVariables.filters ? { filters: queryVariables.filters } : {}
  ); // Pass only filters to count

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
  const users: User[] = usersData?.getAllUsers || []; // Adjust based on actual hook return value
  const roles: Role[] = rolesData?.getAllLeanRoles || [];
  const totalUserCount = userCountData || 0; // Count should now reflect filters

  // --- Style Definitions ---
  const roleColors = [
    "text-gray-400",
    "text-blue-400",
    "text-blue-700",
    "text-red-300",
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
      setShowSkeleton(true);
      if (skeletonTimerRef.current !== null) {
        clearTimeout(skeletonTimerRef.current);
        skeletonTimerRef.current = null;
      }
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
  }, [usersLoading]);

  // --- URL Sync Effect (Filters & Pagination) ---
  useEffect(() => {
    const stateToSetInUrl = {
      currentPage,
      itemsPerPage,
      filterName: debouncedFilterName, // Use debounced values for URL stability
      filterUsername: debouncedFilterUsername,
      filterPosition: debouncedFilterPosition,
      filterEmail: debouncedFilterEmail,
      filterRoleIds,
    };
    const params = new URLSearchParams();
    setUrlParams(params, stateToSetInUrl);
    const newSearch = params.toString();

    // Only navigate if the search string actually changes
    if (newSearch !== location.search.substring(1)) {
      navigate(`${location.pathname}?${newSearch}`, { replace: true });
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedFilterName,
    debouncedFilterUsername,
    debouncedFilterPosition,
    debouncedFilterEmail,
    filterRoleIds,
    location.pathname,
    location.search,
    navigate, // Include location.search to compare against current
  ]);

  // --- Reset Page on Filter Change Effect ---
  useEffect(() => {
    const filtersHaveChanged =
      initialStateFromUrl.name !== debouncedFilterName ||
      initialStateFromUrl.username !== debouncedFilterUsername ||
      initialStateFromUrl.position !== debouncedFilterPosition ||
      initialStateFromUrl.email !== debouncedFilterEmail ||
      JSON.stringify(initialStateFromUrl.roleIds.sort()) !==
        JSON.stringify(filterRoleIds.sort());

    if (filtersHaveChanged && currentPage !== 1) {
      console.log("Filters changed, resetting to page 1");
      setCurrentPage(1);
    }
    // Depend only on filter values. If they change, and page isn't 1, reset page.
  }, [
    debouncedFilterName,
    debouncedFilterUsername,
    debouncedFilterPosition,
    debouncedFilterEmail,
    filterRoleIds,
    initialStateFromUrl,
    currentPage,
  ]);

  // --- Filter Handlers ---
  const handleRoleFilterToggle = useCallback((roleId: string) => {
    setFilterRoleIds((prevRoleIds) =>
      prevRoleIds.includes(roleId)
        ? prevRoleIds.filter((id) => id !== roleId)
        : [...prevRoleIds, roleId]
    );
    // Page reset is handled by the useEffect above
  }, []);

  // --- Pagination Handlers ---
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1); // Reset page when size changes
  }, []);

  // --- Initial Loading/Error States for Page ---
  const criticalError = userCountError || rolesError;
  const isPageLoading = userCountLoading || rolesLoading; // Only for non-table initial data

  if (isPageLoading)
    return <div className="p-6 text-center">Зареждане на страницата...</div>;
  if (criticalError)
    return (
      <div className="p-6 text-red-600">Грешка: {criticalError.message}</div>
    );

  // --- Define Column Widths (match skeleton) ---
  const columnWidths = {
    avatar: "w-16",
    username: "w-40",
    name: "w-1/5",
    position: "w-1/5",
    email: "w-1/4",
    role: "w-1/6",
    edit: "w-20",
  };

  // --- Render Component ---
  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Stats and Actions Section */}
      <section className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Stat Cards Container */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start">
          <StatCard
            amount={totalUserCount ?? 0}
            title="Общо потребители"
            iconColor="text-gray-700"
            className="w-full md:w-auto"
            // Example: Make total clickable to clear role filters
            isActive={filterRoleIds.length === 0} // Active if no specific role is selected
            onClick={() => setFilterRoleIds([])} // Special handler or just set empty array
            // Alternative: Don't make total clickable
          />
          <div className="grid grid-cols-2 gap-4 md:flex md:flex-wrap md:gap-4">
            {roles.map((role, index) => {
              const colorIndex = index % roleColors.length;
              const dynamicColor = roleColors[colorIndex];
              const isActive = filterRoleIds.includes(role._id);
              // TODO: Get filtered count per role if possible, otherwise show total count?
              // const countForRole = ???; // Might need separate query or client-side aggregation

              return (
                <StatCard
                  key={role._id}
                  // Showing total users in role for now, might not reflect current filters
                  amount={role.users?.length || 0}
                  title={capitalizeFirstLetter(role.name)}
                  iconColor={dynamicColor}
                  onClick={() => handleRoleFilterToggle(role._id)}
                  isActive={isActive}
                />
              );
            })}
          </div>
        </div>
        {/* Right Side Actions */}
        <div className="flex flex-col sm:flex-row gap-2 items-center md:items-start flex-shrink-0">
          <button
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
            title={showFilters ? "Скрий филтри" : "Покажи филтри"}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
            Филтри
          </button>
          <button
            onClick={openCreateModal}
            className="flex w-full sm:w-auto items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-gray-50 hover:shadow-md active:bg-gray-100 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={createLoading || updateLoading || usersLoading}
          >
            <PlusIconSolid className="h-5 w-5" />
            Създай Потребител
          </button>
        </div>
      </section>

      {/* Filter Section */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showFilters ? "max-h-screen opacity-100 mb-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-lg text-center text-gray-500">
          <UserSearchBar
            filterName={filterName}
            setFilterName={setFilterName}
            filterUsername={filterUsername}
            setFilterUsername={setFilterUsername}
            filterPosition={filterPosition}
            setFilterPosition={setFilterPosition}
            filterEmail={filterEmail}
            setFilterEmail={setFilterEmail}
            // Pass t function if your search bar uses it for labels/placeholders
            // t={t}
          />
        </div>
      </div>

      {/* Conditional Rendering: Skeleton or Table */}
      {showSkeleton ? (
        <UserTableSkeleton rows={itemsPerPage} />
      ) : usersError ? (
        <div className="p-6 text-red-600 bg-white rounded-lg shadow-md text-center">
          Грешка при зареждане на потребители: {usersError.message}
        </div>
      ) : (
        <section className="flex flex-col shadow-md rounded-lg overflow-hidden bg-white border border-gray-200">
          <div className="overflow-x-auto">
            {/* Added table-fixed */}
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-500 sticky top-0 z-10">
                <tr>
                  {/* Use defined widths */}
                  <th
                    scope="col"
                    className={`${columnWidths.avatar} px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide`}
                  >
                    Аватар
                  </th>
                  <th
                    scope="col"
                    className={`${columnWidths.username} px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide relative`}
                  >
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                    Потребителско име
                  </th>
                  <th
                    scope="col"
                    className={`${columnWidths.name} px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide relative`}
                  >
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                    Име
                  </th>
                  {/* Hide on small screens */}
                  <th
                    scope="col"
                    className={`${columnWidths.position} hidden md:table-cell px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide relative`}
                  >
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                    Позиция
                  </th>
                  <th
                    scope="col"
                    className={`${columnWidths.email} hidden md:table-cell px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide relative`}
                  >
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                    Имейл
                  </th>
                  <th
                    scope="col"
                    className={`${columnWidths.role} px-3 py-4 text-left text-sm font-semibold text-white uppercase tracking-wide relative`}
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
                  return (
                    <tr key={user._id} className="hover:bg-gray-100">
                      <td
                        className={`${columnWidths.avatar} px-3 py-4 whitespace-nowrap`}
                      >
                        <UserAvatar
                          name={user.name || user.username || "User"}
                          imageUrl={imageUrl}
                          size={32}
                        />
                      </td>
                      <td
                        className={`${columnWidths.username} px-3 py-4 whitespace-nowrap font-medium`}
                      >
                        <Link
                          to={`/user-data/${user._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {user.username}
                        </Link>
                      </td>
                      <td
                        className={`${columnWidths.name} px-3 py-4 whitespace-nowrap`}
                      >
                        {user.name || "-"}
                      </td>
                      {/* Hide on small screens */}
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
                      </td>
                      <td
                        className={`${columnWidths.edit} px-3 py-4 whitespace-nowrap text-center`}
                      >
                        <button
                          onClick={() => openEditModal(user)}
                          className="inline-flex justify-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 hover:text-sky-800 active:bg-sky-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
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
                {!usersLoading && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-10 text-center text-gray-500"
                    >
                      Няма намерени потребители
                      {Object.values(queryVariables.filters || {}).some(
                        (v) => v && (!Array.isArray(v) || v.length > 0)
                      )
                        ? " съответстващи на филтрите"
                        : ""}
                      .
                    </td>
                  </tr> // Improved no users message
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pagination Component */}
      {!showSkeleton && totalUserCount > 0 && (
        <Pagination
          totalPages={Math.ceil(totalUserCount / itemsPerPage)}
          totalCount={totalUserCount}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? "Редактирай потребител" : "Създай нов потребител"}
      >
        {/* ... Modal Content (loading/error/form) ... */}
        {(createLoading || updateLoading) && (
          <div className="p-4 text-center">Изпращане...</div>
        )}
        {(createError || updateError) && (
          <div className="p-4 text-center text-red-500">
            Грешка при запис: {createError?.message || updateError?.message}
          </div>
        )}
        {!(createLoading || updateLoading) && (
          <CreateUserForm
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
