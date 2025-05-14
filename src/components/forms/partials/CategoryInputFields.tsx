// src/components/forms/partials/CategoryInputFields.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_LEAN_USERS } from "../../../graphql/query/user"; // Adjust path if needed
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IUser } from "../../../db/interfaces"; // Adjust path if needed

interface IUserLean {
  _id: string;
  name: string;
}

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
  suggestion: string;
  setSuggestion: (value: string) => void;
  expertIds: string[];
  setExpertIds: (ids: string[]) => void;
  managerIds: string[];
  setManagerIds: (ids: string[]) => void;
  archived: boolean;
  setArchived: (isChecked: boolean) => void;
  errorPlaceholderClass: string;
  initialExperts?: IUserLean[];
  initialManagers?: IUserLean[];
}

const CategoryInputFields: React.FC<CategoryInputFieldsProps> = ({
  name,
  setName,
  nameError,
  problem,
  setProblem,
  suggestion,
  setSuggestion,
  expertIds,
  setExpertIds,
  managerIds,
  setManagerIds,
  archived,
  setArchived,
  errorPlaceholderClass,
  initialExperts = [],
  initialManagers = [],
}) => {
  const t = (key: string) => key; // Placeholder for translations

  // --- State & Logic for Experts Dropdown ---
  const [isExpertDropdownVisible, setIsExpertDropdownVisible] = useState(false);
  const expertDisplayInputRef = useRef<HTMLInputElement>(null);
  const expertDropdownRef = useRef<HTMLDivElement>(null);
  const [expertSearchTerm, setExpertSearchTerm] = useState("");
  const [serverFetchedExperts, setServerFetchedExperts] = useState<IUser[]>([]);
  const debouncedExpertSearchTerm = useDebounce(expertSearchTerm, 300);

  const [fetchExperts, { loading: loadingExperts, error: expertsError }] =
    useLazyQuery<{ getLeanUsers: IUser[] }>(GET_LEAN_USERS, {
      onCompleted: (data) => setServerFetchedExperts(data?.getLeanUsers || []),
      fetchPolicy: "network-only",
    });

  useEffect(() => {
    if (isExpertDropdownVisible) {
      const searchTermString =
        typeof debouncedExpertSearchTerm === "string"
          ? debouncedExpertSearchTerm
          : "";
      fetchExperts({ variables: { input: searchTermString } });
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
    const names: string[] = [];
    const uniqueExpertsMap = new Map<string, string>();
    initialExperts.forEach((expert) => {
      if (expertIds.includes(expert._id)) {
        uniqueExpertsMap.set(expert._id, expert.name);
      }
    });
    serverFetchedExperts.forEach((expert) => {
      if (expertIds.includes(expert._id) && !uniqueExpertsMap.has(expert._id)) {
        uniqueExpertsMap.set(expert._id, expert.name);
      }
    });
    expertIds.forEach((id) => {
      if (uniqueExpertsMap.has(id)) {
        names.push(uniqueExpertsMap.get(id)!);
      }
    });
    return (
      names.join(", ") ||
      (expertIds.length > 0 ? `${expertIds.length} selected` : "")
    );
  }, [expertIds, initialExperts, serverFetchedExperts]);

  const handleExpertToggle = (userId: string) =>
    setExpertIds(
      expertIds.includes(userId)
        ? expertIds.filter((id) => id !== userId)
        : [...expertIds, userId]
    );

  const combinedExpertsList = useMemo(() => {
    const map = new Map<string, IUserLean | IUser>();
    initialExperts.forEach((u) => map.set(u._id, u));
    serverFetchedExperts.forEach((u) => {
      if (!map.has(u._id)) map.set(u._id, u);
    });
    return Array.from(map.values());
  }, [initialExperts, serverFetchedExperts]);
  // --- End Experts Dropdown ---

  // --- State & Logic for Managers Dropdown ---
  const [isManagerDropdownVisible, setIsManagerDropdownVisible] =
    useState(false);
  const managerDisplayInputRef = useRef<HTMLInputElement>(null);
  const managerDropdownRef = useRef<HTMLDivElement>(null);
  const [managerSearchTerm, setManagerSearchTerm] = useState("");
  const [serverFetchedManagers, setServerFetchedManagers] = useState<IUser[]>(
    []
  );
  const debouncedManagerSearchTerm = useDebounce(managerSearchTerm, 300);

  const [fetchManagers, { loading: loadingManagers, error: managersError }] =
    useLazyQuery<{ getLeanUsers: IUser[] }>(GET_LEAN_USERS, {
      onCompleted: (data) => setServerFetchedManagers(data?.getLeanUsers || []),
      fetchPolicy: "network-only",
    });

  useEffect(() => {
    if (isManagerDropdownVisible) {
      const searchTermString =
        typeof debouncedManagerSearchTerm === "string"
          ? debouncedManagerSearchTerm
          : "";
      fetchManagers({ variables: { input: searchTermString } });
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
    const names: string[] = [];
    const uniqueManagersMap = new Map<string, string>();
    initialManagers.forEach((manager) => {
      if (managerIds.includes(manager._id)) {
        uniqueManagersMap.set(manager._id, manager.name);
      }
    });
    serverFetchedManagers.forEach((manager) => {
      if (
        managerIds.includes(manager._id) &&
        !uniqueManagersMap.has(manager._id)
      ) {
        uniqueManagersMap.set(manager._id, manager.name);
      }
    });
    managerIds.forEach((id) => {
      if (uniqueManagersMap.has(id)) {
        names.push(uniqueManagersMap.get(id)!);
      }
    });
    return (
      names.join(", ") ||
      (managerIds.length > 0 ? `${managerIds.length} selected` : "")
    );
  }, [managerIds, initialManagers, serverFetchedManagers]);

  const handleManagerToggle = (userId: string) =>
    setManagerIds(
      managerIds.includes(userId)
        ? managerIds.filter((id) => id !== userId)
        : [...managerIds, userId]
    );

  const combinedManagersList = useMemo(() => {
    const map = new Map<string, IUserLean | IUser>();
    initialManagers.forEach((u) => map.set(u._id, u));
    serverFetchedManagers.forEach((u) => {
      if (!map.has(u._id)) map.set(u._id, u);
    });
    return Array.from(map.values());
  }, [initialManagers, serverFetchedManagers]);
  // --- End Managers Dropdown ---

  return (
    <>
      {/* Row 1: Name | Archived */}
      {/* Name Input */}
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

      {/* Archived Checkbox */}
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
      {/* Experts Filter */}
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
            {loadingExperts && combinedExpertsList.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t("Зареждане...")}
              </div>
            ) : expertsError ? (
              <div className="px-3 py-2 text-sm text-red-600">
                {t("Грешка")}: {expertsError.message}
              </div>
            ) : combinedExpertsList.length === 0 &&
              !expertSearchTerm &&
              !loadingExperts ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t("Няма намерени потребители. Започнете да търсите.")}
              </div>
            ) : combinedExpertsList.length === 0 &&
              expertSearchTerm &&
              !loadingExperts ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t("Няма намерени потребители за търсенето.")}
              </div>
            ) : (
              combinedExpertsList.map((user) => (
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
        <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
      </div>

      {/* Managers Filter */}
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
            {loadingManagers && combinedManagersList.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t("Зареждане...")}
              </div>
            ) : managersError ? (
              <div className="px-3 py-2 text-sm text-red-600">
                {t("Грешка")}: {managersError.message}
              </div>
            ) : combinedManagersList.length === 0 &&
              !managerSearchTerm &&
              !loadingManagers ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t("Няма намерени потребители. Започнете да търсите.")}
              </div>
            ) : combinedManagersList.length === 0 &&
              managerSearchTerm &&
              !loadingManagers ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t("Няма намерени потребители за търсенето.")}
              </div>
            ) : (
              combinedManagersList.map((user) => (
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
        <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
      </div>

      {/* Row 3: Problem | Suggestion */}
      {/* Problem Textarea */}
      <div>
        <label
          htmlFor="categoryProblem"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("Проблем")}
        </label>
        <textarea
          id="categoryProblem"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
      </div>

      {/* Suggestion Textarea */}
      <div>
        <label
          htmlFor="categorySuggestion"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("Предложение")}
        </label>
        <textarea
          id="categorySuggestion"
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
      </div>
    </>
  );
};

export default CategoryInputFields;
