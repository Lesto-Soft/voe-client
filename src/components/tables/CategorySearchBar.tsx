// src/components/tables/CategorySearchBar.tsx
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
      console.log(
        "Fetching/Refetching users for filters. Initial:",
        !initialLoadComplete,
        "RefetchKey:",
        refetchKey
      );
      fetchAllUsersQuery({ variables: { input: "" } });
    }
  }, [initialLoadComplete, loadingUsers, fetchAllUsersQuery, refetchKey]);

  useEffect(() => {
    ensureUsersFetched();
  }, [ensureUsersFetched]);

  const [isExpertDropdownVisible, setIsExpertDropdownVisible] = useState(false);
  const expertDisplayInputRef = useRef<HTMLInputElement>(null);
  const expertDropdownRef = useRef<HTMLDivElement>(null);
  const [expertSearchTerm, setExpertSearchTerm] = useState("");

  const displayableExperts = useMemo(() => {
    const actualExperts = allAvailableUsers.filter(
      (user) =>
        Array.isArray(user.expert_categories) &&
        user.expert_categories.length > 0
    );
    if (!expertSearchTerm.trim()) {
      return actualExperts;
    }
    return actualExperts.filter((user) =>
      user.name.toLowerCase().includes(expertSearchTerm.toLowerCase())
    );
  }, [allAvailableUsers, expertSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        expertDisplayInputRef.current &&
        !expertDisplayInputRef.current.contains(event.target as Node) &&
        expertDropdownRef.current &&
        !expertDropdownRef.current.contains(event.target as Node)
      ) {
        setIsExpertDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedExpertNames = useMemo(() => {
    return (
      expertIds
        .map((id) => userCache[id]?.name)
        .filter((name) => !!name)
        .join(", ") || ""
    );
  }, [expertIds, userCache]);

  const handleExpertToggle = (user: ILeanUser) => {
    setUserCache((prevCache) => {
      if (prevCache[user._id]?.name === user.name) return prevCache;
      return { ...prevCache, [user._id]: user };
    });
    setExpertIds(
      expertIds.includes(user._id)
        ? expertIds.filter((id) => id !== user._id)
        : [...expertIds, user._id]
    );
  };

  const openExpertDropdown = () => {
    ensureUsersFetched();
    setIsExpertDropdownVisible(true);
  };

  const [isManagerDropdownVisible, setIsManagerDropdownVisible] =
    useState(false);
  const managerDisplayInputRef = useRef<HTMLInputElement>(null);
  const managerDropdownRef = useRef<HTMLDivElement>(null);
  const [managerSearchTerm, setManagerSearchTerm] = useState("");

  const displayableManagers = useMemo(() => {
    const actualManagers = allAvailableUsers.filter(
      (user) =>
        Array.isArray(user.managed_categories) &&
        user.managed_categories.length > 0
    );
    if (!managerSearchTerm.trim()) {
      return actualManagers;
    }
    return actualManagers.filter((user) =>
      user.name.toLowerCase().includes(managerSearchTerm.toLowerCase())
    );
  }, [allAvailableUsers, managerSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        managerDisplayInputRef.current &&
        !managerDisplayInputRef.current.contains(event.target as Node) &&
        managerDropdownRef.current &&
        !managerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsManagerDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedManagerNames = useMemo(() => {
    return (
      managerIds
        .map((id) => userCache[id]?.name)
        .filter((name) => !!name)
        .join(", ") || ""
    );
  }, [managerIds, userCache]);

  const handleManagerToggle = (user: ILeanUser) => {
    setUserCache((prevCache) => {
      if (prevCache[user._id]?.name === user.name) return prevCache;
      return { ...prevCache, [user._id]: user };
    });
    setManagerIds(
      managerIds.includes(user._id)
        ? managerIds.filter((id) => id !== user._id)
        : [...managerIds, user._id]
    );
  };

  const openManagerDropdown = () => {
    ensureUsersFetched();
    setIsManagerDropdownVisible(true);
  };

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

  const handleArchivedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "true") setFilterArchived(true);
    else if (value === "false") setFilterArchived(false);
    else setFilterArchived(undefined);
  };

  const t_hardcoded = (key: string) => key;

  return (
    <div className="pt-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 items-start">
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

        <div className="relative">
          <label
            htmlFor="filterExpertsDisplay"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t_hardcoded("Експерти")}
          </label>
          <div className="relative">
            <input
              type="text"
              id="filterExpertsDisplay"
              ref={expertDisplayInputRef}
              value={selectedExpertNames || ""}
              onClick={openExpertDropdown}
              readOnly
              className="bg-white w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer truncate"
              placeholder={t_hardcoded("Избери експерти...")}
            />
            {expertIds.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpertIds([]);
                  setExpertSearchTerm("");
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                title={t_hardcoded("Изчисти експерти")}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {isExpertDropdownVisible && (
            <div
              ref={expertDropdownRef}
              className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    value={expertSearchTerm}
                    onChange={(e) => setExpertSearchTerm(e.target.value)}
                    placeholder={t_hardcoded("Търси експерт...")}
                    className="w-full px-2 py-1 pr-8 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                    autoFocus
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
                  <label
                    key={user._id}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-indigo-50"
                  >
                    <input
                      type="checkbox"
                      checked={expertIds.includes(user._id)}
                      onChange={() => handleExpertToggle(user)}
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

        <div className="relative">
          <label
            htmlFor="filterManagersDisplay"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t_hardcoded("Мениджъри")}
          </label>
          <div className="relative">
            <input
              type="text"
              id="filterManagersDisplay"
              ref={managerDisplayInputRef}
              value={selectedManagerNames || ""}
              onClick={openManagerDropdown}
              readOnly
              className="bg-white w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer truncate"
              placeholder={t_hardcoded("Избери мениджъри...")}
            />
            {managerIds.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setManagerIds([]);
                  setManagerSearchTerm("");
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                title={t_hardcoded("Изчисти мениджъри")}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {isManagerDropdownVisible && (
            <div
              ref={managerDropdownRef}
              className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    value={managerSearchTerm}
                    onChange={(e) => setManagerSearchTerm(e.target.value)}
                    placeholder={t_hardcoded("Търси мениджър...")}
                    className="w-full px-2 py-1 pr-8 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                    autoFocus
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
                  <label
                    key={user._id}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-indigo-50"
                  >
                    <input
                      type="checkbox"
                      checked={managerIds.includes(user._id)}
                      onChange={() => handleManagerToggle(user)}
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

        <div>
          <label
            htmlFor="filterArchived"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t_hardcoded("Статус")}
          </label>
          <select
            id="filterArchived"
            value={
              filterArchived === undefined ? "all" : String(filterArchived)
            }
            onChange={handleArchivedChange}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">{t_hardcoded("Всички")}</option>
            <option value="false">{t_hardcoded("Активни")}</option>
            <option value="true">{t_hardcoded("Архивирани")}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
export default CategorySearchBar;
