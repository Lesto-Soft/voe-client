// src/components/search/CategorySearchBar.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_LEAN_USERS } from "../../graphql/query/user"; // Adjust path
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ILeanUser {
  _id: string;
  name: string;
  role: { _id: string } | null;
  managed_categories: { _id: string }[] | null;
  expert_categories: { _id: string }[] | null;
}

interface CategorySearchBarProps {
  filterName: string;
  setFilterName: (value: string) => void;
  expertIds: string[];
  setExpertIds: (ids: string[]) => void;
  managerIds: string[];
  setManagerIds: (ids: string[]) => void;
  filterArchived: boolean | undefined;
  setFilterArchived: (value: boolean | undefined) => void;
  refetchKey?: number;
}

const CategorySearchBar: React.FC<CategorySearchBarProps> = ({
  filterName,
  setFilterName,
  expertIds: expertIdsProp,
  setExpertIds,
  managerIds: managerIdsProp,
  setManagerIds,
  filterArchived,
  setFilterArchived,
  refetchKey,
}) => {
  // Ensure expertIds and managerIds are always arrays
  const expertIds = expertIdsProp || [];
  const managerIds = managerIdsProp || [];

  const [allAvailableUsers, setAllAvailableUsers] = useState<ILeanUser[]>([]);
  const [userCache, setUserCache] = useState<Record<string, ILeanUser>>({});
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const [fetchAllUsersQuery, { loading: loadingUsers, error: usersError }] =
    useLazyQuery<{ getLeanUsers: ILeanUser[] }>(GET_LEAN_USERS, {
      onCompleted: (data) => {
        const users = data?.getLeanUsers || [];
        setAllAvailableUsers(users);
        const newCache: Record<string, ILeanUser> = {};
        users.forEach((user) => {
          newCache[user._id] = user;
        });
        setUserCache((prevCache) => ({ ...prevCache, ...newCache }));
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
      },
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    });

  const ensureUsersFetched = useCallback(() => {
    if (
      (!initialLoadComplete || (refetchKey && refetchKey > 0)) &&
      !loadingUsers &&
      fetchAllUsersQuery
    ) {
      fetchAllUsersQuery({ variables: { input: "" } });
    }
  }, [initialLoadComplete, loadingUsers, fetchAllUsersQuery, refetchKey]);

  useEffect(() => {
    ensureUsersFetched();
  }, [ensureUsersFetched]);

  // --- Refs for Labels ---
  const expertLabelRef = useRef<HTMLLabelElement>(null);
  const managerLabelRef = useRef<HTMLLabelElement>(null);
  const statusLabelRef = useRef<HTMLLabelElement>(null);

  // --- State & Logic for Experts Dropdown ---
  const [isExpertDropdownVisible, setIsExpertDropdownVisible] = useState(false);
  const expertDisplayInputRef = useRef<HTMLDivElement>(null);
  const expertDropdownRef = useRef<HTMLDivElement>(null);
  const [expertSearchTerm, setExpertSearchTerm] = useState("");

  const displayableExperts = useMemo(() => {
    const actualExperts = allAvailableUsers.filter(
      (user) =>
        Array.isArray(user.expert_categories) &&
        user.expert_categories.length > 0
    );
    if (!expertSearchTerm.trim()) return actualExperts;
    return actualExperts.filter((user) =>
      user.name.toLowerCase().includes(expertSearchTerm.toLowerCase())
    );
  }, [allAvailableUsers, expertSearchTerm]);

  const toggleExpertDropdown = useCallback(() => {
    if (!isExpertDropdownVisible) ensureUsersFetched();
    setIsExpertDropdownVisible((prev) => !prev);
  }, [isExpertDropdownVisible, ensureUsersFetched]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        expertLabelRef.current?.contains(target) ||
        expertDisplayInputRef.current?.contains(target) ||
        expertDropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsExpertDropdownVisible(false);
    };
    if (isExpertDropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpertDropdownVisible]);

  const selectedExpertNames = useMemo(() => {
    return (
      expertIds
        .map((id) => userCache[id]?.name)
        .filter(Boolean)
        .join(", ") || ""
    );
  }, [expertIds, userCache]);

  const handleExpertToggle = useCallback(
    (user: ILeanUser) => {
      // Wrapped in useCallback
      setUserCache((prevCache) => {
        if (prevCache[user._id]?.name === user.name) return prevCache; // Avoid update if same
        return { ...prevCache, [user._id]: user };
      });
      // Use the current state value (expertIds) directly to construct the new state
      const newExpertIds = expertIds.includes(user._id)
        ? expertIds.filter((id) => id !== user._id)
        : [...expertIds, user._id];
      setExpertIds(newExpertIds);
    },
    [expertIds, setExpertIds]
  ); // Added dependencies for useCallback

  // --- State & Logic for Managers Dropdown ---
  const [isManagerDropdownVisible, setIsManagerDropdownVisible] =
    useState(false);
  const managerDisplayInputRef = useRef<HTMLDivElement>(null);
  const managerDropdownRef = useRef<HTMLDivElement>(null);
  const [managerSearchTerm, setManagerSearchTerm] = useState("");

  const displayableManagers = useMemo(() => {
    const actualManagers = allAvailableUsers.filter(
      (user) =>
        Array.isArray(user.managed_categories) &&
        user.managed_categories.length > 0
    );
    if (!managerSearchTerm.trim()) return actualManagers;
    return actualManagers.filter((user) =>
      user.name.toLowerCase().includes(managerSearchTerm.toLowerCase())
    );
  }, [allAvailableUsers, managerSearchTerm]);

  const toggleManagerDropdown = useCallback(() => {
    if (!isManagerDropdownVisible) ensureUsersFetched();
    setIsManagerDropdownVisible((prev) => !prev);
  }, [isManagerDropdownVisible, ensureUsersFetched]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        managerLabelRef.current?.contains(target) ||
        managerDisplayInputRef.current?.contains(target) ||
        managerDropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsManagerDropdownVisible(false);
    };
    if (isManagerDropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isManagerDropdownVisible]);

  const selectedManagerNames = useMemo(() => {
    return (
      managerIds
        .map((id) => userCache[id]?.name)
        .filter(Boolean)
        .join(", ") || ""
    );
  }, [managerIds, userCache]);

  const handleManagerToggle = useCallback(
    (user: ILeanUser) => {
      // Wrapped in useCallback
      setUserCache((prevCache) => {
        if (prevCache[user._id]?.name === user.name) return prevCache; // Avoid update if same
        return { ...prevCache, [user._id]: user };
      });
      // Use the current state value (managerIds) directly to construct the new state
      const newManagerIds = managerIds.includes(user._id)
        ? managerIds.filter((id) => id !== user._id)
        : [...managerIds, user._id];
      setManagerIds(newManagerIds);
    },
    [managerIds, setManagerIds]
  ); // Added dependencies for useCallback

  // --- Fetch users if selected IDs are not in cache ---
  useEffect(() => {
    const allSelectedIds = [...new Set([...expertIdsProp, ...managerIdsProp])];
    const idsNotInCache = allSelectedIds.filter((id) => !userCache[id]);
    if (idsNotInCache.length > 0 && !loadingUsers) {
      ensureUsersFetched();
    }
  }, [
    expertIdsProp,
    managerIdsProp,
    userCache,
    loadingUsers,
    ensureUsersFetched,
  ]);

  // --- State & Logic for Status Dropdown ---
  const [isStatusDropdownVisible, setIsStatusDropdownVisible] = useState(false);
  const statusDisplayRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions = useMemo(
    () => [
      { label: "Всички", value: undefined },
      { label: "Активни", value: false },
      { label: "Архивирани", value: true },
    ],
    []
  );

  const selectedStatusLabel = useMemo(() => {
    return (
      statusOptions.find((opt) => opt.value === filterArchived)?.label ||
      "Всички"
    );
  }, [filterArchived, statusOptions]);

  const toggleStatusDropdown = useCallback(() => {
    setIsStatusDropdownVisible((prev) => !prev);
  }, []);

  const handleStatusSelect = useCallback(
    (value: boolean | undefined) => {
      // Wrapped in useCallback
      setFilterArchived(value);
      setIsStatusDropdownVisible(false); // Close dropdown on selection
    },
    [setFilterArchived]
  ); // Added dependencies

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        statusLabelRef.current?.contains(target) ||
        statusDisplayRef.current?.contains(target) ||
        statusDropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsStatusDropdownVisible(false);
    };
    if (isStatusDropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isStatusDropdownVisible]);

  const t_hardcoded = (key: string) => key;

  return (
    <div className="pt-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 items-start">
        {/* Name Filter */}
        <div>
          <label
            htmlFor="filterCategoryName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t_hardcoded("Име на категория")}
          </label>
          <div className="relative">
            <input
              type="text"
              id="filterCategoryName"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="bg-white w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={t_hardcoded("Търси по име...")}
            />
            {filterName && (
              <button
                type="button"
                onClick={() => setFilterName("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                title={t_hardcoded("Изчисти име")}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Experts Filter */}
        <div className="relative">
          <label
            htmlFor="filterExpertsDisplay"
            ref={expertLabelRef}
            className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer"
            onClick={toggleExpertDropdown}
          >
            {t_hardcoded("Експерти")}
          </label>
          <div className="relative">
            <div
              id="filterExpertsDisplay"
              ref={expertDisplayInputRef}
              onClick={toggleExpertDropdown}
              className="bg-white w-full px-3 py-2 pr-14 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer truncate"
              role="button"
              tabIndex={0}
              aria-haspopup="listbox"
              aria-expanded={isExpertDropdownVisible}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleExpertDropdown();
              }}
            >
              <span
                className={
                  selectedExpertNames ? "text-gray-900" : "text-gray-400"
                }
              >
                {selectedExpertNames || t_hardcoded("Избери експерти...")}
              </span>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {expertIds.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent dropdown from toggling
                    setExpertIds([]);
                    setExpertSearchTerm("");
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 pointer-events-auto"
                  title={t_hardcoded("Изчисти експерти")}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  expertIds.length > 0 ? "ml-1" : ""
                } ${isExpertDropdownVisible ? "transform rotate-180" : ""}`}
                aria-hidden="true"
              />
            </div>
          </div>
          {isExpertDropdownVisible && (
            <div
              ref={expertDropdownRef}
              className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              role="listbox"
              aria-labelledby="filterExpertsDisplay"
            >
              <div className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    value={expertSearchTerm}
                    onChange={(e) => setExpertSearchTerm(e.target.value)}
                    placeholder={t_hardcoded("Търси експерт...")}
                    className="w-full px-2 py-1 pr-8 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    autoFocus
                    aria-label={t_hardcoded("Търсене на експерт")}
                  />
                  {expertSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setExpertSearchTerm("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-2 pb-2 text-gray-500 hover:text-gray-700"
                      title={t_hardcoded("Изчисти търсенето")}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {loadingUsers && !initialLoadComplete ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t_hardcoded("Зареждане...")}
                </div>
              ) : usersError ? (
                <div className="px-3 py-2 text-sm text-red-600">
                  {t_hardcoded("Грешка при зареждане на потребители")}:{" "}
                  {usersError.message}
                </div>
              ) : displayableExperts.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t_hardcoded("Няма намерени експерти.")}
                </div>
              ) : (
                displayableExperts.map((user) => (
                  <label // This label is for the checkbox and its text, correct use
                    key={user._id}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-indigo-50"
                    role="option"
                    aria-selected={expertIds.includes(user._id)}
                    // htmlFor={`expert-checkbox-${user._id}`} // Optional: if input had an id
                  >
                    <input
                      type="checkbox"
                      // id={`expert-checkbox-${user._id}`} // Optional: if label used htmlFor
                      checked={expertIds.includes(user._id)}
                      onChange={() => handleExpertToggle(user)} // Pass the function reference
                      className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-800">
                      {user.name}
                    </span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {/* Managers Filter */}
        <div className="relative">
          <label
            htmlFor="filterManagersDisplay"
            ref={managerLabelRef}
            className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer"
            onClick={toggleManagerDropdown}
          >
            {t_hardcoded("Мениджъри")}
          </label>
          <div className="relative">
            <div
              id="filterManagersDisplay"
              ref={managerDisplayInputRef}
              onClick={toggleManagerDropdown}
              className="bg-white w-full px-3 py-2 pr-14 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer truncate"
              role="button"
              tabIndex={0}
              aria-haspopup="listbox"
              aria-expanded={isManagerDropdownVisible}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleManagerDropdown();
              }}
            >
              <span
                className={
                  selectedManagerNames ? "text-gray-900" : "text-gray-400"
                }
              >
                {selectedManagerNames || t_hardcoded("Избери мениджъри...")}
              </span>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {managerIds.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent dropdown from toggling
                    setManagerIds([]);
                    setManagerSearchTerm("");
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 pointer-events-auto"
                  title={t_hardcoded("Изчисти мениджъри")}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  managerIds.length > 0 ? "ml-1" : ""
                } ${isManagerDropdownVisible ? "transform rotate-180" : ""}`}
                aria-hidden="true"
              />
            </div>
          </div>
          {isManagerDropdownVisible && (
            <div
              ref={managerDropdownRef}
              className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              role="listbox"
              aria-labelledby="filterManagersDisplay"
            >
              <div className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    value={managerSearchTerm}
                    onChange={(e) => setManagerSearchTerm(e.target.value)}
                    placeholder={t_hardcoded("Търси мениджър...")}
                    className="w-full px-2 py-1 pr-8 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    autoFocus
                    aria-label={t_hardcoded("Търсене на мениджър")}
                  />
                  {managerSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setManagerSearchTerm("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-2 pb-2 text-gray-500 hover:text-gray-700"
                      title={t_hardcoded("Изчисти търсенето")}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {loadingUsers && !initialLoadComplete ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t_hardcoded("Зареждане...")}
                </div>
              ) : usersError ? (
                <div className="px-3 py-2 text-sm text-red-600">
                  {t_hardcoded("Грешка при зареждане на потребители")}:{" "}
                  {usersError.message}
                </div>
              ) : displayableManagers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t_hardcoded("Няма намерени мениджъри.")}
                </div>
              ) : (
                displayableManagers.map((user) => (
                  <label // This label is for the checkbox and its text, correct use
                    key={user._id}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-indigo-50"
                    role="option"
                    aria-selected={managerIds.includes(user._id)}
                    // htmlFor={`manager-checkbox-${user._id}`} // Optional: if input had an id
                  >
                    <input
                      type="checkbox"
                      // id={`manager-checkbox-${user._id}`} // Optional: if label used htmlFor
                      checked={managerIds.includes(user._id)}
                      onChange={() => handleManagerToggle(user)} // Pass the function reference
                      className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-800">
                      {user.name}
                    </span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <label
            htmlFor="filterStatusDisplay"
            ref={statusLabelRef}
            className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer"
            onClick={toggleStatusDropdown}
          >
            {t_hardcoded("Статус")}
          </label>
          <div
            id="filterStatusDisplay"
            ref={statusDisplayRef}
            onClick={toggleStatusDropdown}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer flex items-center justify-between"
            role="button"
            tabIndex={0}
            aria-haspopup="listbox"
            aria-expanded={isStatusDropdownVisible}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleStatusDropdown();
            }}
          >
            <span className="text-gray-900">{selectedStatusLabel}</span>
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isStatusDropdownVisible ? "transform rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </div>
          {isStatusDropdownVisible && (
            <div
              ref={statusDropdownRef}
              className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              role="listbox"
              aria-labelledby="filterStatusDisplay"
            >
              {statusOptions.map((option) => (
                <div
                  key={option.label}
                  onClick={() => handleStatusSelect(option.value)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${
                    filterArchived === option.value
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "text-gray-800"
                  }`}
                  role="option"
                  aria-selected={filterArchived === option.value}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStatusSelect(option.value);
                    }
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySearchBar;
