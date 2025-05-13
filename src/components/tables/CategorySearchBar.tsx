// src/components/search/CategorySearchBar.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLazyQuery } from "@apollo/client";
// Ensure this path is correct for your project structure
import { GET_LEAN_USERS } from "../../graphql/query/user";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Interface for Lean User (adjust if your actual ILeanUser is different)
interface ILeanUser {
  _id: string;
  name: string;
}

interface CategorySearchBarProps {
  filterName: string;
  setFilterName: (value: string) => void;
  expertIds: string[]; // Expecting this to be an array
  setExpertIds: (ids: string[]) => void;
  managerIds: string[]; // Expecting this to be an array
  setManagerIds: (ids: string[]) => void;
  filterArchived: boolean | undefined;
  setFilterArchived: (value: boolean | undefined) => void;
  // t?: (key: string) => string; // Optional translation function
}

// --- Custom Hook: useDebounce ---
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
// --- End Custom Hook ---

const CategorySearchBar: React.FC<CategorySearchBarProps> = ({
  filterName,
  setFilterName,
  expertIds: expertIdsProp, // Use prop alias
  setExpertIds,
  managerIds: managerIdsProp, // Use prop alias
  setManagerIds,
  filterArchived,
  setFilterArchived,
  // t = (key: string) => key, // Default translation
}) => {
  // Ensure expertIds and managerIds are always arrays internally
  const expertIds = expertIdsProp || [];
  const managerIds = managerIdsProp || [];

  // --- State & Logic for Experts Dropdown ---
  const [isExpertDropdownVisible, setIsExpertDropdownVisible] = useState(false);
  const expertDisplayInputRef = useRef<HTMLInputElement>(null);
  const expertDropdownRef = useRef<HTMLDivElement>(null);
  const [expertSearchTerm, setExpertSearchTerm] = useState("");
  const [serverFetchedExperts, setServerFetchedExperts] = useState<ILeanUser[]>(
    []
  );
  const debouncedExpertSearchTerm = useDebounce(expertSearchTerm, 300);

  const [fetchExperts, { loading: loadingExperts, error: expertsError }] =
    useLazyQuery<{ getLeanUsers: ILeanUser[] }>(GET_LEAN_USERS, {
      onCompleted: (data) => {
        setServerFetchedExperts(data?.getLeanUsers || []);
      },
      fetchPolicy: "network-only",
    });

  useEffect(() => {
    if (isExpertDropdownVisible) {
      fetchExperts({ variables: { input: debouncedExpertSearchTerm } });
    }
  }, [isExpertDropdownVisible, debouncedExpertSearchTerm, fetchExperts]);

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
    const names = serverFetchedExperts
      .filter((user) => expertIds.includes(user._id))
      .map((user) => user.name);
    return names.length > 0 ? names.join(", ") : "";
  }, [expertIds, serverFetchedExperts]);

  const handleExpertToggle = (userId: string) => {
    if (typeof setExpertIds === "function") {
      setExpertIds(
        expertIds.includes(userId)
          ? expertIds.filter((id) => id !== userId)
          : [...expertIds, userId]
      );
    } else {
      console.error(
        "setExpertIds is not a function in CategorySearchBar",
        setExpertIds
      );
    }
  };
  // --- End Experts Dropdown ---

  // --- State & Logic for Managers Dropdown ---
  const [isManagerDropdownVisible, setIsManagerDropdownVisible] =
    useState(false);
  const managerDisplayInputRef = useRef<HTMLInputElement>(null);
  const managerDropdownRef = useRef<HTMLDivElement>(null);
  const [managerSearchTerm, setManagerSearchTerm] = useState("");
  const [serverFetchedManagers, setServerFetchedManagers] = useState<
    ILeanUser[]
  >([]);
  const debouncedManagerSearchTerm = useDebounce(managerSearchTerm, 300);

  const [fetchManagers, { loading: loadingManagers, error: managersError }] =
    useLazyQuery<{ getLeanUsers: ILeanUser[] }>(GET_LEAN_USERS, {
      onCompleted: (data) => {
        setServerFetchedManagers(data?.getLeanUsers || []);
      },
      fetchPolicy: "network-only",
    });

  useEffect(() => {
    if (isManagerDropdownVisible) {
      fetchManagers({ variables: { input: debouncedManagerSearchTerm } });
    }
  }, [isManagerDropdownVisible, debouncedManagerSearchTerm, fetchManagers]);

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
    const names = serverFetchedManagers
      .filter((user) => managerIds.includes(user._id))
      .map((user) => user.name);
    return names.length > 0 ? names.join(", ") : "";
  }, [managerIds, serverFetchedManagers]);

  const handleManagerToggle = (userId: string) => {
    if (typeof setManagerIds === "function") {
      setManagerIds(
        managerIds.includes(userId)
          ? managerIds.filter((id) => id !== userId)
          : [...managerIds, userId]
      );
    } else {
      console.error(
        "setManagerIds is not a function in CategorySearchBar",
        setManagerIds
      );
    }
  };
  // --- End Managers Dropdown ---

  const handleArchivedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "true") setFilterArchived(true);
    else if (value === "false") setFilterArchived(false);
    else setFilterArchived(undefined);
  };

  const t = (key: string) => key; // Placeholder for translation

  return (
    <div className="pt-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 items-start">
        {/* Name Filter */}
        <div>
          <label
            htmlFor="filterCategoryName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("Име на категория")}
          </label>
          <div className="relative">
            <input
              type="text"
              id="filterCategoryName"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="bg-white w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={t("Търси по име...")}
            />
            {filterName && (
              <button
                type="button"
                onClick={() => setFilterName("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                title={t("Изчисти име")}
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("Експерти")}
          </label>
          <div className="relative">
            <input
              type="text"
              id="filterExpertsDisplay"
              ref={expertDisplayInputRef}
              value={selectedExpertNames || ""}
              onClick={() => setIsExpertDropdownVisible((v) => !v)}
              readOnly
              className="bg-white w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer truncate"
              placeholder={t("Избери експерти...")}
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
                title={t("Изчисти експерти")}
              >
                {" "}
                <XMarkIcon className="h-5 w-5" />{" "}
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
                  {" "}
                  {/* Added relative wrapper for search input */}
                  <input
                    type="text"
                    value={expertSearchTerm}
                    onChange={(e) => setExpertSearchTerm(e.target.value)}
                    placeholder={t("Търси експерт...")}
                    className="w-full px-2 py-1 pr-8 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm" // Added pr-8
                    autoFocus
                  />
                  {expertSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setExpertSearchTerm("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-2 pb-2 text-gray-500 hover:text-gray-700" // Adjusted padding for pb-2
                      title={t("Изчисти търсенето")}
                    >
                      <XMarkIcon className="h-4 w-4" />{" "}
                      {/* Smaller icon for dropdown search */}
                    </button>
                  )}
                </div>
              </div>
              {loadingExperts && serverFetchedExperts.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t("Зареждане...")}
                </div>
              ) : expertsError ? (
                <div className="px-3 py-2 text-sm text-red-600">
                  {t("Грешка")}: {expertsError.message}
                </div>
              ) : serverFetchedExperts.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t("Няма намерени потребители.")}
                </div>
              ) : (
                serverFetchedExperts.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-indigo-50"
                  >
                    <input
                      type="checkbox"
                      checked={expertIds.includes(user._id)}
                      onChange={() => handleExpertToggle(user._id)}
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("Мениджъри")}
          </label>
          <div className="relative">
            <input
              type="text"
              id="filterManagersDisplay"
              ref={managerDisplayInputRef}
              value={selectedManagerNames || ""}
              onClick={() => setIsManagerDropdownVisible((v) => !v)}
              readOnly
              className="bg-white w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer truncate"
              placeholder={t("Избери мениджъри...")}
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
                title={t("Изчисти мениджъри")}
              >
                {" "}
                <XMarkIcon className="h-5 w-5" />{" "}
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
                  {" "}
                  {/* Added relative wrapper for search input */}
                  <input
                    type="text"
                    value={managerSearchTerm}
                    onChange={(e) => setManagerSearchTerm(e.target.value)}
                    placeholder={t("Търси мениджър...")}
                    className="w-full px-2 py-1 pr-8 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm" // Added pr-8
                    autoFocus
                  />
                  {managerSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setManagerSearchTerm("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-2 pb-2 text-gray-500 hover:text-gray-700" // Adjusted padding for pb-2
                      title={t("Изчисти търсенето")}
                    >
                      <XMarkIcon className="h-4 w-4" />{" "}
                      {/* Smaller icon for dropdown search */}
                    </button>
                  )}
                </div>
              </div>
              {loadingManagers && serverFetchedManagers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t("Зареждане...")}
                </div>
              ) : managersError ? (
                <div className="px-3 py-2 text-sm text-red-600">
                  {t("Грешка")}: {managersError.message}
                </div>
              ) : serverFetchedManagers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t("Няма намерени потребители.")}
                </div>
              ) : (
                serverFetchedManagers.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-indigo-50"
                  >
                    <input
                      type="checkbox"
                      checked={managerIds.includes(user._id)}
                      onChange={() => handleManagerToggle(user._id)}
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

        {/* Archived Filter */}
        <div>
          <label
            htmlFor="filterArchived"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("Статус")}
          </label>
          <select
            id="filterArchived"
            value={
              filterArchived === undefined ? "all" : String(filterArchived)
            }
            onChange={handleArchivedChange}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">{t("Всички")}</option>
            <option value="false">{t("Активни")}</option>
            <option value="true">{t("Архивирани")}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CategorySearchBar;
