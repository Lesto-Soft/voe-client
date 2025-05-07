// src/pages/UserManagementPage.tsx

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
} from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
// Use react-router-dom for v6+
import { Link, useLocation, useNavigate } from "react-router";
import {
  useGetAllUsers,
  useCountUsers,
  useCreateUser,
  useUpdateUser,
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
import UserSearchBar from "../components/tables/UserSearchBar"; // Adjust path as needed

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

// Interface for the filters matching backend/buildUserQueryVariables expectations
interface UserFiltersState {
  name?: string;
  username?: string;
  position?: string;
  email?: string;
  roleIds?: string[];
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
function getUrlParams(
  params: URLSearchParams
): UserFiltersState & { page: number; perPage: number } {
  const page = Number(params.get("page")) || 1;
  const perPageParam = Number(params.get("perPage"));
  const perPage = [10, 25, 50].includes(perPageParam) ? perPageParam : 10;
  const name = params.get("name") || "";
  const username = params.get("username") || "";
  const position = params.get("position") || "";
  const email = params.get("email") || "";
  const roleIdsParam = params.get("roleIds");
  const roleIds = roleIdsParam ? roleIdsParam.split(",").filter(Boolean) : [];
  console.log("[getUrlParams] Parsed:", {
    page,
    perPage,
    name,
    username,
    position,
    email,
    roleIds,
  }); // Log parsed values
  return { page, perPage, name, username, position, email, roleIds };
}

function setUrlParams(params: URLSearchParams, state: any) {
  // Note: state keys match filter state names + currentPage/itemsPerPage
  params.set("page", String(state.currentPage));
  params.set("perPage", String(state.itemsPerPage));
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
  console.log(
    "[setUrlParams] Setting params from state:",
    state,
    "Resulting params:",
    params.toString()
  ); // Log setting process
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

  // Parse initial state from URL only once on mount
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
    initialStateFromUrl.roleIds ?? []
  );

  // Debounced Filter State
  const debouncedFilterName = useDebounce(filterName, 500);
  const debouncedFilterUsername = useDebounce(filterUsername, 500);
  const debouncedFilterPosition = useDebounce(filterPosition, 500);
  const debouncedFilterEmail = useDebounce(filterEmail, 500);

  // --- Ref to track previous filter values for accurate change detection ---
  const prevFiltersRef = useRef<UserFiltersState | undefined>(undefined);

  // Environment Variables
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // --- Prepare Input Object for Hooks ---
  const currentQueryInput = useMemo(() => {
    const input: any = {
      itemsPerPage: itemsPerPage,
      currentPage: currentPage - 1, // Send 0-based index
      name: debouncedFilterName,
      username: debouncedFilterUsername,
      position: debouncedFilterPosition,
      email: debouncedFilterEmail,
      roleIds: filterRoleIds,
    };
    // Clean up empty/null/empty array filters before passing to hook
    Object.keys(input).forEach((key) => {
      if (
        (input[key] === "" ||
          input[key] === null ||
          (Array.isArray(input[key]) && input[key].length === 0)) &&
        key !== "currentPage" &&
        key !== "itemsPerPage"
      ) {
        // Keep pagination even if 0
        delete input[key];
      }
    });
    // console.log("[Page] Input object passed to hooks:", JSON.stringify(input, null, 2)); // Debug log
    return input;
  }, [
    currentPage,
    itemsPerPage,
    debouncedFilterName,
    debouncedFilterUsername,
    debouncedFilterPosition,
    debouncedFilterEmail,
    filterRoleIds,
  ]);

  // --- GraphQL Hooks ---
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
    roles: rolesDataFromHook,
    error: rolesErrorFromHook,
    loading: rolesLoadingFromHook,
    refetch: refetchRoles,
  } = useGetRoles();
  const roles: Role[] = rolesDataFromHook?.getAllLeanRoles || [];

  // --- Process Data ---
  // console.log(`--- Frontend Processed --- Users Length: ${users?.length ?? 0}, Total Count: ${totalUserCount ?? 0}`);

  // --- Style Definitions ---
  const roleColors = [
    "text-gray-400",
    "text-blue-400",
    "text-indigo-400",
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
    formData: any,
    editingUserId: string | null,
    avatarData: AttachmentInput | null | undefined
  ) => {
    const finalInput: CreateUserInput | UpdateUserInput = {
      ...formData,
      ...(avatarData !== undefined && { avatar: avatarData }),
    };
    console.log(`Submitting form for ${editingUserId ? "update" : "create"}`, {
      editingUserId,
      finalInput,
    });
    try {
      if (editingUserId) {
        console.log(`Calling updateUser with ID: ${editingUserId}`);
        await updateUser(editingUserId, finalInput as UpdateUserInput);
      } else {
        console.log(`Calling createUser`);
        await createUser(finalInput as CreateUserInput);
      }
      console.log("Mutation successful, refetching data...");
      await Promise.all([
        refetchUsers(),
        refetchUserCount(),
        refetchRoles ? refetchRoles() : Promise.resolve(),
      ]);
      console.log("Refetching complete.");
      setAvatarVersion(Date.now());
      closeModal();
    } catch (err: any) {
      console.error(
        `Error during user ${editingUserId ? "update" : "create"}:`,
        err
      );
      const graphQLError = err.graphQLErrors?.[0]?.message;
      const networkError = err.networkError?.message;
      const generalMessage = err.message;
      alert(
        `Грешка при ${editingUserId ? "редактиране" : "създаване"}: ${
          graphQLError || networkError || generalMessage || "Неизвестна грешка"
        }`
      );
    }
  };

  // --- Skeleton Visibility Effect ---
  useEffect(() => {
    const isLoading = usersLoading || countLoading;
    if (isLoading) {
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
  }, [usersLoading, countLoading]);

  // --- Pagination Handlers (Update URL directly) ---
  const handlePageChange = useCallback(
    (page: number) => {
      // Avoid setting state if page hasn't changed (can happen from URL sync)
      if (page === currentPage) return;

      console.log(`[Pagination] handlePageChange called with page: ${page}`);
      setCurrentPage(page); // Update state first

      // Prepare URL params based on the NEW state and current filters
      const params = new URLSearchParams(location.search);
      const stateForUrl = {
        currentPage: page, // Use the new page number
        itemsPerPage,
        filterName: debouncedFilterName, // Use debounced for consistency with query trigger
        filterUsername: debouncedFilterUsername,
        filterPosition: debouncedFilterPosition,
        filterEmail: debouncedFilterEmail,
        filterRoleIds, // Direct state is fine here for URL
      };
      setUrlParams(params, stateForUrl);
      navigate(`${location.pathname}?${params.toString()}`); // Navigate keeps history
    },
    [
      currentPage,
      itemsPerPage,
      debouncedFilterName,
      debouncedFilterUsername,
      debouncedFilterPosition,
      debouncedFilterEmail,
      filterRoleIds,
      location.search,
      navigate,
      location.pathname,
    ]
  ); // Include currentPage in dependencies

  const handleItemsPerPageChange = useCallback(
    (size: number) => {
      if (size === itemsPerPage) return;

      console.log(
        `[Pagination] handleItemsPerPageChange called with size: ${size}`
      );
      const newPage = 1;
      // Update state first
      setItemsPerPage(size);
      setCurrentPage(newPage);

      // Update URL
      const params = new URLSearchParams(location.search);
      const stateForUrl = {
        currentPage: newPage,
        itemsPerPage: size,
        filterName: debouncedFilterName,
        filterUsername: debouncedFilterUsername,
        filterPosition: debouncedFilterPosition,
        filterEmail: debouncedFilterEmail,
        filterRoleIds,
      };
      setUrlParams(params, stateForUrl);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    },
    [
      itemsPerPage,
      debouncedFilterName,
      debouncedFilterUsername,
      debouncedFilterPosition,
      debouncedFilterEmail,
      filterRoleIds,
      location.search,
      navigate,
      location.pathname,
    ]
  ); // Include itemsPerPage

  // --- Effect to Update URL & Reset Page ONLY when FILTERS change ---
  useEffect(() => {
    // Current filters based on debounced values (as these trigger the query)
    const currentFilters: UserFiltersState = {
      name: debouncedFilterName,
      username: debouncedFilterUsername,
      position: debouncedFilterPosition,
      email: debouncedFilterEmail,
      roleIds: filterRoleIds, // Direct role IDs trigger change instantly
    };

    // Get previous filters (use initial state on first render as base)
    // Check if ref has been assigned yet
    const previousFilters = prevFiltersRef.current ?? {
      name: initialStateFromUrl.name,
      username: initialStateFromUrl.username,
      position: initialStateFromUrl.position,
      email: initialStateFromUrl.email,
      roleIds: initialStateFromUrl.roleIds,
    };

    const stringifiedCurrent = JSON.stringify({
      ...currentFilters,
      roleIds: [...(currentFilters.roleIds ?? [])].sort(),
    });
    const stringifiedPrevious = JSON.stringify({
      ...previousFilters,
      roleIds: [...(previousFilters.roleIds ?? [])].sort(),
    });
    const filtersHaveChanged = stringifiedCurrent !== stringifiedPrevious;

    // Update ref *after* comparison but *before* potential state change/navigation
    prevFiltersRef.current = currentFilters;

    if (filtersHaveChanged) {
      console.log("Filters changed, updating URL and resetting page to 1");
      const newPage = 1;
      // Only update state if page isn't already 1
      if (currentPage !== newPage) {
        setCurrentPage(newPage);
        // Don't navigate here - let the state update trigger the next render cycle
        // where the navigation will happen based on the new state, OR rely on
        // the URL sync effect below if preferred. Let's try letting the next
        // render cycle handle the URL update via the other effect.
        // OR navigate here explicitly:
        const params = new URLSearchParams();
        const stateToSetInUrl = {
          currentPage: newPage,
          itemsPerPage,
          filterName: debouncedFilterName,
          filterUsername: debouncedFilterUsername,
          filterPosition: debouncedFilterPosition,
          filterEmail: debouncedFilterEmail,
          filterRoleIds,
        };
        setUrlParams(params, stateToSetInUrl);
        console.log(
          "[Filter Effect] Navigating due to filter change:",
          params.toString()
        );
        navigate(`${location.pathname}?${params.toString()}`, {
          replace: true,
        });
      } else {
        // If page is already 1, filters changed, still need to update URL
        const params = new URLSearchParams(location.search); // Use current params as base?
        const stateToSetInUrl = {
          currentPage: newPage, // Ensure page=1
          itemsPerPage,
          filterName: debouncedFilterName,
          filterUsername: debouncedFilterUsername,
          filterPosition: debouncedFilterPosition,
          filterEmail: debouncedFilterEmail,
          filterRoleIds,
        };
        setUrlParams(params, stateToSetInUrl);
        const newSearch = params.toString();
        if (newSearch !== location.search.substring(1)) {
          // Avoid redundant navigation
          console.log(
            "[Filter Effect] Navigating (page already 1):",
            params.toString()
          );
          navigate(`${location.pathname}?${newSearch}`, { replace: true });
        }
      }
    }
    // Depend only on the filter values + dependencies needed inside effect
  }, [
    debouncedFilterName,
    debouncedFilterUsername,
    debouncedFilterPosition,
    debouncedFilterEmail,
    filterRoleIds,
    // Include other state values needed inside the effect
    itemsPerPage,
    currentPage, // Need currentPage to check if reset needed, itemsPerPage for URL
    initialStateFromUrl, // Needed for first comparison
    location.pathname,
    navigate,
  ]);

  // --- Effect to sync state FROM URL ---
  // This primarily handles browser back/forward or manual URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stateFromUrl = getUrlParams(params);
    // console.log("https://www.synceffect.com/ Running. URL state:", stateFromUrl, "Current page state:", currentPage);

    let needsStateUpdate = false;

    if (stateFromUrl.page !== currentPage) {
      console.log(
        `https://www.synceffect.com/ URL page ${stateFromUrl.page} differs from state ${currentPage}. Updating state.`
      );
      setCurrentPage(stateFromUrl.page);
      needsStateUpdate = true; // Mark that state changed
    }
    if (stateFromUrl.perPage !== itemsPerPage) {
      console.log(
        `https://www.synceffect.com/ URL perPage ${stateFromUrl.perPage} differs from state ${itemsPerPage}. Updating state.`
      );
      setItemsPerPage(stateFromUrl.perPage);
      needsStateUpdate = true;
    }

    // Only sync filters FROM URL if they differ from the NON-DEBOUNCED state
    // This prevents user typing from being overridden by the URL immediately
    if (stateFromUrl.name !== filterName) {
      console.log(
        `https://www.synceffect.com/ URL name differs from state. Updating state.`
      );
      setFilterName(stateFromUrl.name);
      needsStateUpdate = true;
    }
    if (stateFromUrl.username !== filterUsername) {
      console.log(
        `https://www.synceffect.com/ URL username differs from state. Updating state.`
      );
      setFilterUsername(stateFromUrl.username);
      needsStateUpdate = true;
    }
    if (stateFromUrl.position !== filterPosition) {
      console.log(
        `https://www.synceffect.com/ URL position differs from state. Updating state.`
      );
      setFilterPosition(stateFromUrl.position);
      needsStateUpdate = true;
    }
    if (stateFromUrl.email !== filterEmail) {
      console.log(
        `https://www.synceffect.com/ URL email differs from state. Updating state.`
      );
      setFilterEmail(stateFromUrl.email);
      needsStateUpdate = true;
    }
    if (
      JSON.stringify((stateFromUrl.roleIds ?? []).sort()) !==
      JSON.stringify(filterRoleIds.sort())
    ) {
      console.log(
        `https://www.synceffect.com/ URL roleIds differ from state. Updating state.`
      );
      setFilterRoleIds(stateFromUrl.roleIds ?? []);
      needsStateUpdate = true;
    }

    // If state was changed by this effect, the component will re-render,
    // and the query variables will update based on the new state.

    // Depend only on location.search, otherwise state updates here will cause infinite loops
  }, [location.search]);

  // --- Filter Handlers ---
  const handleRoleFilterToggle = useCallback((roleId: string) => {
    setFilterRoleIds((prevRoleIds) =>
      prevRoleIds.includes(roleId)
        ? prevRoleIds.filter((id) => id !== roleId)
        : [...prevRoleIds, roleId]
    );
    // Page reset is handled by the filter change effect
  }, []);

  // --- Initial Loading/Error States for Page ---
  const criticalError = rolesErrorFromHook;
  const isPageLoading = rolesLoadingFromHook;

  // Log final render state just before returning JSX
  // console.log( `--- Frontend Final Render State --- usersLoading: ${usersLoading}, countLoading: ${countLoading}, usersError: ${!!usersError}, countError: ${!!countError}, showSkeleton: ${showSkeleton}, TotalCount: ${totalUserCount}, Users Length: ${ users?.length ?? 0 }`);

  if (isPageLoading)
    return <div className="p-6 text-center">Зареждане на страницата...</div>;
  if (criticalError)
    return (
      <div className="p-6 text-red-600">
        {" "}
        Грешка при зареждане на роли: {criticalError.message}{" "}
      </div>
    );

  // Define Column Widths
  const columnWidths = {
    avatar: "w-16",
    username: "w-1/6",
    name: "w-1/5",
    position: "w-1/5",
    email: "w-1/6",
    role: "w-1/10",
    edit: "w-1/10",
  };

  // --- Render Component ---
  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Stats and Actions Section */}
      <section className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start">
          <StatCard
            amount={totalUserCount ?? 0}
            title="Общо потребители"
            iconColor="text-gray-700"
            className="w-full md:w-auto"
            isActive={filterRoleIds.length === 0}
            onClick={() => setFilterRoleIds([])}
          />
          <div
            aria-hidden="true"
            className="hidden md:block self-stretch w-1 mx-2
                       bg-gradient-to-b from-transparent via-gray-300 to-transparent"
          ></div>

          <div className="grid grid-cols-2 gap-4 md:flex md:flex-wrap md:gap-4">
            {roles.map((role: Role, index: number) => {
              const colorIndex = index % roleColors.length;
              const dynamicColor = roleColors[colorIndex];
              const isActive = filterRoleIds.includes(role._id);
              return (
                <StatCard
                  key={role._id}
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
        <div className="flex flex-col sm:flex-row gap-2 items-center md:items-start flex-shrink-0">
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
      </section>

      {/* Filter Section */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showFilters ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <UserSearchBar
          filterName={filterName ?? ""}
          setFilterName={setFilterName}
          filterUsername={filterUsername ?? ""}
          setFilterUsername={setFilterUsername}
          filterPosition={filterPosition ?? ""}
          setFilterPosition={setFilterPosition}
          filterEmail={filterEmail ?? ""}
          setFilterEmail={setFilterEmail}
        />
      </div>

      {/* Conditional Rendering: Skeleton or Table */}
      {showSkeleton ? (
        <UserTableSkeleton rows={itemsPerPage} />
      ) : usersError || countError ? (
        <div className="p-6 text-red-600 bg-white rounded-lg shadow-md text-center">
          {" "}
          Грешка при зареждане: {usersError?.message ||
            countError?.message}{" "}
        </div>
      ) : (
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
                    className={`${columnWidths.username} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative whitespace-nowrap`}
                  >
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-400"></span>
                    Потребителско име
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
                {users.map((user: User) => {
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
                          className="w-30 inline-flex justify-center rounded bg-sky-100 p-1.5 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all duration-150 ease-in-out hover:cursor-pointer hover:bg-sky-200 hover:text-sky-800 active:bg-sky-300 active:scale-[0.96] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                          aria-label={`Редактирай ${user.username}`}
                          disabled={
                            createLoading ||
                            updateLoading ||
                            usersLoading ||
                            countLoading
                          }
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {/* Use combined loading state */}
                {!(usersLoading || countLoading) && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-10 text-center text-gray-500"
                    >
                      Няма намерени потребители
                      {Object.keys(currentQueryInput || {}).some((key) => {
                        if (key === "itemsPerPage" || key === "currentPage")
                          return false;
                        const value = currentQueryInput[key];
                        return Array.isArray(value)
                          ? value.length > 0
                          : !!value;
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
      )}

      {/* Pagination Component */}
      {!showSkeleton &&
        !(usersLoading || countLoading) &&
        totalUserCount > 0 && (
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
            roles={roles} // Pass roles fetched for page
            rolesLoading={rolesLoadingFromHook}
            rolesError={rolesErrorFromHook}
          />
        )}
      </CreateUserModal>
    </div>
  );
};

export default UserManagementPage;
