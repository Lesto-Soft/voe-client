// src/components/forms/partials/CategoryInputFields.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
// Removed IUser import as ILeanUserForForm is more specific here
import TextEditor from "./TextEditor";
import { ROLES } from "../../../utils/GLOBAL_PARAMETERS";

// Define a lean user type that includes the role ID for the form, matching what parent passes
interface ILeanUserForForm {
  _id: string;
  name: string;
  username: string;
  role: { _id: string } | null; // Role can be null
}

// useDebounce function (can be kept if client-side search term debouncing is still desired, though less critical now)
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

interface CategoryInputFieldsProps {
  name: string;
  setName: (value: string) => void;
  nameError: string | null;
  problem: string;
  setProblem: (value: string) => void;
  problemError: string | null;
  suggestion: string;
  setSuggestion: (value: string) => void;
  suggestionError: string | null;
  expertIds: string[];
  setExpertIds: (ids: string[]) => void;
  managerIds: string[];
  setManagerIds: (ids: string[]) => void;
  archived: boolean;
  setArchived: (isChecked: boolean) => void;
  errorPlaceholderClass: string;
  initialExperts?: ILeanUserForForm[]; // Used for pre-selecting and displaying names
  initialManagers?: ILeanUserForForm[]; // Used for pre-selecting and displaying names
  allUsersForAssigning: ILeanUserForForm[]; // Users passed from parent
  usersLoading: boolean; // Loading state for allUsersForAssigning
}

const CategoryInputFields: React.FC<CategoryInputFieldsProps> = ({
  name,
  setName,
  nameError,
  problem,
  setProblem,
  problemError,
  suggestion,
  setSuggestion,
  suggestionError,
  expertIds,
  setExpertIds,
  managerIds,
  setManagerIds,
  archived,
  setArchived,
  errorPlaceholderClass,
  initialExperts = [],
  initialManagers = [],
  allUsersForAssigning,
  usersLoading,
}) => {
  const t = (key: string) => key; // Placeholder for translations

  // Filter allUsersForAssigning to get only those with Expert or Admin roles
  const assignableUsers = useMemo(() => {
    if (!allUsersForAssigning) return []; // Guard against undefined
    return allUsersForAssigning.filter((user) => {
      const userRoleId = user.role?._id;
      return userRoleId === ROLES.EXPERT || userRoleId === ROLES.ADMIN;
    });
  }, [allUsersForAssigning]);

  // State & Logic for Experts Dropdown
  const [isExpertDropdownVisible, setIsExpertDropdownVisible] = useState(false);
  const expertDisplayInputRef = useRef<HTMLInputElement>(null);
  const expertDropdownRef = useRef<HTMLDivElement>(null);
  const [expertSearchTerm, setExpertSearchTerm] = useState("");
  // const debouncedExpertSearchTerm = useDebounce(expertSearchTerm, 300); // Keep if needed for performance on large lists

  // Client-side filtering for expert dropdown from assignableUsers
  const displayableExperts = useMemo(() => {
    if (!expertSearchTerm.trim()) {
      return assignableUsers; // Start with users already filtered by role
    }
    return assignableUsers.filter((user) =>
      user.name.toLowerCase().includes(expertSearchTerm.toLowerCase())
    );
  }, [assignableUsers, expertSearchTerm]);

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

  // Create a cache/map from allUsersForAssigning AND initialExperts/Managers for quick name lookups
  const userNameCache = useMemo(() => {
    const cache: Record<string, string> = {};
    allUsersForAssigning.forEach((user) => {
      cache[user._id] = user.name;
    });
    // Ensure initial experts/managers names are available if they were somehow not in allUsersForAssigning
    // (though ideally allUsersForAssigning should be comprehensive)
    initialExperts.forEach((user) => {
      if (!cache[user._id] && user.name) cache[user._id] = user.name;
    });
    initialManagers.forEach((user) => {
      if (!cache[user._id] && user.name) cache[user._id] = user.name;
    });
    return cache;
  }, [allUsersForAssigning, initialExperts, initialManagers]);

  const selectedExpertNames = useMemo(() => {
    return (
      expertIds
        .map((id) => userNameCache[id])
        .filter((name) => !!name)
        .join(", ") ||
      (expertIds.length > 0 ? `${expertIds.length} ${t("избрани")}` : "")
    );
  }, [expertIds, userNameCache, t]);

  const handleExpertToggle = (userId: string) =>
    setExpertIds(
      expertIds.includes(userId)
        ? expertIds.filter((id) => id !== userId)
        : [...expertIds, userId]
    );

  // State & Logic for Managers Dropdown
  const [isManagerDropdownVisible, setIsManagerDropdownVisible] =
    useState(false);
  const managerDisplayInputRef = useRef<HTMLInputElement>(null);
  const managerDropdownRef = useRef<HTMLDivElement>(null);
  const [managerSearchTerm, setManagerSearchTerm] = useState("");
  // const debouncedManagerSearchTerm = useDebounce(managerSearchTerm, 300);

  const displayableManagers = useMemo(() => {
    if (!managerSearchTerm.trim()) {
      return assignableUsers;
    }
    return assignableUsers.filter((user) =>
      user.name.toLowerCase().includes(managerSearchTerm.toLowerCase())
    );
  }, [assignableUsers, managerSearchTerm]);

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
        .map((id) => userNameCache[id])
        .filter((name) => !!name)
        .join(", ") ||
      (managerIds.length > 0 ? `${managerIds.length} ${t("избрани")}` : "")
    );
  }, [managerIds, userNameCache, t]);

  const handleManagerToggle = (userId: string) =>
    setManagerIds(
      managerIds.includes(userId)
        ? managerIds.filter((id) => id !== userId)
        : [...managerIds, userId]
    );

  return (
    <>
      {/* Row 1: Name | Archived */}
      <div>
        <label
          htmlFor="categoryName"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("Име на категория")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="categoryName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={`w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            nameError ? "border-red-500" : "border-gray-300"
          }`}
        />
        <p
          className={`${errorPlaceholderClass} ${
            nameError ? "text-red-500" : ""
          }`}
        >
          {nameError || <>&nbsp;</>}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-transparent select-none">
          &nbsp;
        </label>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="categoryArchived"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="categoryArchived"
            className="ml-2 block text-sm text-gray-900"
          >
            {t("Архивирана категория")}
          </label>
        </div>
        <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
      </div>

      {/* Row 2: Experts | Managers */}
      <div className="relative">
        <label
          htmlFor="filterExpertsDisplayForm"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t("Експерти")}
        </label>
        <div className="relative">
          <input
            type="text"
            id="filterExpertsDisplayForm"
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
                  placeholder={t("Търси експерт...")}
                  className="w-full px-2 py-1 pr-8 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  autoFocus
                />
                {expertSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setExpertSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 pb-2 text-gray-500 hover:text-gray-700"
                    title={t("Изчисти търсенето")}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {usersLoading ? ( // Check the loading state from props
              <div className="px-3 py-2 text-sm text-gray-500">
                {t("Зареждане...")}
              </div>
            ) : displayableExperts.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t(
                  expertSearchTerm
                    ? "Няма намерени потребители за търсенето."
                    : "Няма налични потребители с роля Експерт/Админ."
                )}
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
                    onChange={() => handleExpertToggle(user._id)}
                    className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm flex justify-between items-center w-full">
                    <span className="text-gray-800">{user.name}</span>{" "}
                    <span className="font-semibold text-gray-500">
                      {user.username}
                    </span>{" "}
                  </span>
                </label>
              ))
            )}
          </div>
        )}
        <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
      </div>

      <div className="relative">
        <label
          htmlFor="filterManagersDisplayForm"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t("Мениджъри")}
        </label>
        <div className="relative">
          <input
            type="text"
            id="filterManagersDisplayForm"
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
                  placeholder={t("Търси мениджър...")}
                  className="w-full px-2 py-1 pr-8 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  autoFocus
                />
                {managerSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setManagerSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 pb-2 text-gray-500 hover:text-gray-700"
                    title={t("Изчисти търсенето")}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {usersLoading ? ( // Check the loading state from props
              <div className="px-3 py-2 text-sm text-gray-500">
                {t("Зареждане...")}
              </div>
            ) : displayableManagers.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t(
                  managerSearchTerm
                    ? "Няма намерени потребители за търсенето."
                    : "Няма налични потребители с роля Експерт/Админ."
                )}
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
                    onChange={() => handleManagerToggle(user._id)}
                    className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm flex justify-between items-center w-full">
                    <span className="text-gray-800">{user.name}</span>{" "}
                    <span className="font-semibold text-gray-500">
                      {user.username}
                    </span>{" "}
                  </span>
                </label>
              ))
            )}
          </div>
        )}
        <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
      </div>

      {/* Row 3: Problem | Suggestion - Using TextEditor */}
      <div>
        <label
          htmlFor="categoryProblem"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("Проблем")} <span className="text-red-500">*</span>
        </label>
        <TextEditor
          content={problem}
          onUpdate={(html) => setProblem(html)}
          placeholder={t("Опишете проблема...")}
          height="120px"
        />
        <p
          className={`${errorPlaceholderClass} ${
            problemError ? "text-red-500" : ""
          }`}
        >
          {problemError || <>&nbsp;</>}
        </p>
      </div>

      <div>
        <label
          htmlFor="categorySuggestion"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("Предложение")} <span className="text-red-500">*</span>
        </label>
        <TextEditor
          content={suggestion}
          onUpdate={(html) => setSuggestion(html)}
          placeholder={t("Напишете предложение...")}
          height="120px"
        />
        <p
          className={`${errorPlaceholderClass} ${
            suggestionError ? "text-red-500" : ""
          }`}
        >
          {suggestionError || <>&nbsp;</>}
        </p>
      </div>
    </>
  );
};

export default CategoryInputFields;
