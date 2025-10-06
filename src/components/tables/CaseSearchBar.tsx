import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLazyQuery } from "@apollo/client"; // Assuming Apollo Client
import { ICase, ICategory } from "../../db/interfaces";
import { GET_LEAN_USERS } from "../../graphql/query/user";
import { GET_ACTIVE_CATEGORIES } from "../../graphql/query/category";
import { XMarkIcon, CalendarDaysIcon } from "@heroicons/react/24/outline"; // Import icons
import DateRangeSelector from "../features/userAnalytics/DateRangeSelector";
import CustomDropdown from "../global/CustomDropdown";
import CustomMultiSelectDropdown from "../global/CustomMultiSelectDropdown";
import {
  getPriorityOptions,
  getReadStatusOptions,
  getStatusOptions,
  getTypeOptions,
} from "../../utils/dashboardFilterUtils";

// Interface for Lean User (assuming structure)
interface ILeanUser {
  _id: string;
  name: string;
  username: string;
}

// Define the shape of the props
interface CaseSearchBarProps {
  caseNumber: string;
  setCaseNumber: (v: string) => void;
  priority: ICase["priority"] | "";
  setPriority: (v: ICase["priority"] | "") => void;
  type: ICase["type"] | "";
  setType: (v: ICase["type"] | "") => void;
  creatorId: string; // Store selected creator ID
  setCreatorId: (v: string) => void;
  categoryIds: string[]; // Store selected category IDs
  setCategoryIds: (v: string[]) => void;
  content: string;
  setContent: (v: string) => void;
  status: (ICase["status"] | "")[];
  setStatus: (v: (ICase["status"] | "")[]) => void;
  readStatus: string;
  setReadStatus: (v: string) => void;
  dateRange: { startDate: Date | null; endDate: Date | null };
  setDateRange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  t: (key: string) => string;
}

const CaseSearchBar: React.FC<CaseSearchBarProps> = ({
  caseNumber,
  setCaseNumber,
  priority,
  setPriority,
  type,
  setType,
  creatorId,
  setCreatorId,
  categoryIds,
  setCategoryIds,
  content,
  setContent,
  status,
  setStatus,
  readStatus,
  setReadStatus,
  dateRange,
  setDateRange,
  t,
}) => {
  const [creatorInput, setCreatorInput] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<ILeanUser | null>(
    null
  );
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [fetchedInitialCreator, setFetchedInitialCreator] = useState(false);
  const creatorInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDateSelectorVisible, setIsDateSelectorVisible] = useState(
    !!(dateRange.startDate || dateRange.endDate)
  );

  // ✅ MODIFIED: Changed from && to || to show active state if at least one date is selected.
  const isDateFilterActive =
    dateRange.startDate !== null || dateRange.endDate !== null;

  const [serverFetchedUsers, setServerFetchedUsers] = useState<ILeanUser[]>([]);

  const [
    fetchUsers,
    { loading: loadingUsers, error: usersError, data: usersData },
  ] = useLazyQuery<{ getLeanUsers: ILeanUser[] }>(GET_LEAN_USERS, {
    onCompleted: (data) => {
      setServerFetchedUsers(data?.getLeanUsers || []);
    },
  });

  useEffect(() => {
    if (creatorId && !creatorInput && !fetchedInitialCreator) {
      fetchUsers({ variables: { userId: creatorId } });
      setFetchedInitialCreator(true);
      setIsDropdownVisible(false);
    }
  }, [creatorId, creatorInput, fetchedInitialCreator, fetchUsers]);

  useEffect(() => {
    if (fetchedInitialCreator && !creatorInput && usersData?.getLeanUsers) {
      const initialUser = usersData.getLeanUsers.find(
        (u) => u._id === creatorId
      );
      if (initialUser) {
        setSelectedCreator(initialUser);
        setCreatorInput(initialUser.name + `(${initialUser.username})`);
        setIsDropdownVisible(false);
        setServerFetchedUsers(usersData.getLeanUsers);
      } else {
        setCreatorId("");
        setFetchedInitialCreator(false);
        setSelectedCreator(null);
      }
    }
  }, [usersData, fetchedInitialCreator, creatorId, creatorInput, setCreatorId]);

  useEffect(() => {
    if (!creatorId) {
      setCreatorInput("");
      setSelectedCreator(null);
      setFetchedInitialCreator(false);
    }
  }, [creatorId]);
  useEffect(() => {
    if (!dateRange.startDate && !dateRange.endDate) {
      setIsDateSelectorVisible(false);
    }
  }, [dateRange]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        creatorInputRef.current &&
        !creatorInputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
        if (!creatorId) {
          setCreatorInput("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [creatorId]);

  const handleCreatorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCreatorInput(newValue);
    if (creatorId && fetchedInitialCreator) {
      setCreatorId("");
      setSelectedCreator(null);
    }
    setFetchedInitialCreator(false);
    setIsDropdownVisible(true);
  };

  const handleCreatorInputFocus = () => {
    setIsDropdownVisible(true);
    if (creatorInput === "" && !fetchedInitialCreator) {
      fetchUsers({ variables: { search: "" } }).catch((error) => {
        console.error("Error fetching all users:", error);
      });
    }
  };

  const handleUserSelect = (user: ILeanUser) => {
    setCreatorId(user._id);
    setSelectedCreator(user);
    setCreatorInput(user.name + `(${user.username})`);
    setIsDropdownVisible(false);
    setFetchedInitialCreator(true);
  };

  const clearCreatorSelection = () => {
    setCreatorId("");
    setCreatorInput("");
    setSelectedCreator(null);
    setFetchedInitialCreator(false);
    setIsDropdownVisible(false);
    creatorInputRef.current?.focus();
  };

  const filteredDisplayUsers = useMemo(() => {
    if (!creatorInput) {
      return serverFetchedUsers;
    }
    const lowerCaseInput = creatorInput.toLowerCase();
    return serverFetchedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerCaseInput) ||
        user.username.toLowerCase().includes(lowerCaseInput)
    );
  }, [creatorInput, serverFetchedUsers]);

  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] =
    useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [serverFetchedCategories, setServerFetchedCategories] = useState<
    ICategory[]
  >([]);
  const [categorySearch, setCategorySearch] = useState("");

  const [
    fetchCategories,
    { loading: loadingCategories, error: categoriesError },
  ] = useLazyQuery<{ getLeanActiveCategories: ICategory[] }>(
    GET_ACTIVE_CATEGORIES,
    {
      onCompleted: (data) => {
        setServerFetchedCategories(data?.getLeanActiveCategories || []);
      },
    }
  );

  useEffect(() => {
    if (categoryIds.length > 0 && serverFetchedCategories.length === 0) {
      fetchCategories();
    }
  }, [categoryIds, serverFetchedCategories.length, fetchCategories]);

  useEffect(() => {
    if (isCategoryDropdownVisible && serverFetchedCategories.length === 0) {
      fetchCategories();
    }
  }, [
    isCategoryDropdownVisible,
    serverFetchedCategories.length,
    fetchCategories,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target as Node) &&
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownVisible(false);
        if (!creatorId) {
          setCreatorInput("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [creatorId]);

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    return serverFetchedCategories.filter((cat) =>
      cat.name.toLowerCase().includes(search)
    );
  }, [serverFetchedCategories, categorySearch]);

  const selectedCategoryNames = useMemo(() => {
    return serverFetchedCategories
      .filter((cat) => categoryIds.includes(cat._id))
      .map((cat) => cat.name)
      .join(", ");
  }, [categoryIds, serverFetchedCategories]);

  const handleCategoryToggle = (catId: string) => {
    if (categoryIds.includes(catId)) {
      setCategoryIds(categoryIds.filter((id) => id !== catId));
    } else {
      setCategoryIds([...categoryIds, catId]);
    }
  };

  const handleCategoryInputClick = () => {
    setIsCategoryDropdownVisible((v) => !v);
  };

  const handleCategorySearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCategorySearch(e.target.value);
  };

  const handleReopenCreatorDropdown = () => {
    setSelectedCreator(null);
    setCreatorId("");
    setCreatorInput("");
    setFetchedInitialCreator(false);
    setIsDropdownVisible(true);
    if (serverFetchedUsers.length === 0) {
      fetchUsers({ variables: { search: "" } });
    }
  };

  const showDropdown = isDropdownVisible;
  const priorityOptions = getPriorityOptions(t);
  const typeOptions = getTypeOptions(t);
  const statusOptions = getStatusOptions(t);
  const readStatusOptions = getReadStatusOptions(t);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex flex-wrap gap-x-4 gap-y-3 items-end">
        <div>
          <label
            htmlFor="caseNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("case_number")}
          </label>
          <input
            type="text"
            id="caseNumber"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            className="bg-white w-28 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder={t("search_by_case_number")}
          />
        </div>
        <CustomDropdown
          label={t("priority")}
          options={priorityOptions}
          value={priority}
          onChange={(value) => setPriority(value as ICase["priority"] | "")}
        />
        <CustomDropdown
          label={t("type")}
          options={typeOptions}
          value={type}
          onChange={(value) => setType(value as ICase["type"] | "")}
        />
        <div className="relative flex-1 min-w-[200px]">
          <label
            htmlFor="creator"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("creator")}
          </label>
          {selectedCreator ? (
            <div
              onClick={handleReopenCreatorDropdown}
              className="cursor-pointer bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm flex justify-between items-center"
            >
              <span
                className="text-gray-800 truncate max-w-[170px]"
                title={selectedCreator.name}
              >
                {selectedCreator.name}
              </span>
              <span className="font-semibold text-gray-500 mr-6">
                {selectedCreator.username}
              </span>
            </div>
          ) : (
            <input
              type="text"
              id="creator"
              ref={creatorInputRef}
              value={creatorInput}
              onChange={handleCreatorInputChange}
              onFocus={handleCreatorInputFocus}
              className="cursor-pointer bg-white w-full px-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder={t("choose_creator")}
              autoComplete="off"
            />
          )}
          {creatorId && (
            <button
              type="button"
              onClick={clearCreatorSelection}
              className="mt-6 absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 hover:text-gray-900 focus:outline-none cursor-pointer"
              title={t("clear_creator")}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {loadingUsers && serverFetchedUsers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t("loading")}
                </div>
              ) : usersError ? (
                <div className="px-3 py-2 text-sm text-red-600">
                  {t("error")}: {usersError.message}
                </div>
              ) : filteredDisplayUsers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t("no_users")}
                </div>
              ) : (
                filteredDisplayUsers.map((user) => (
                  <div
                    key={user._id}
                    className="px-3 py-2 text-sm text-gray-800 hover:bg-indigo-50 cursor-pointer"
                    onMouseDown={() => handleUserSelect(user)}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span
                        className="text-gray-800 truncate max-w-[170px]"
                        title={user.name}
                      >
                        {user.name}
                      </span>
                      <span className="font-semibold text-gray-500">
                        {user.username}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {loadingUsers && serverFetchedUsers.length > 0 && (
                <div className="px-3 py-1 text-xs text-gray-400 text-center">
                  {t("refreshing")}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("categories")}
          </label>
          <input
            type="text"
            id="category"
            ref={categoryInputRef}
            value={selectedCategoryNames}
            onClick={handleCategoryInputClick}
            readOnly
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
            placeholder={t("choose_categories")}
            autoComplete="off"
          />
          {isCategoryDropdownVisible && (
            <div
              ref={categoryDropdownRef}
              className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div className="p-2">
                <input
                  type="text"
                  value={categorySearch}
                  onChange={handleCategorySearchChange}
                  placeholder={t("search")}
                  className="w-full px-2 py-1 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                />
              </div>
              {loadingCategories && serverFetchedCategories.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t("loading")}
                </div>
              ) : categoriesError ? (
                <div className="px-3 py-2 text-sm text-red-600">
                  {t("error")}: {categoriesError.message}
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t("no_categories")}
                </div>
              ) : (
                filteredCategories.map((cat) => (
                  <label
                    key={cat._id}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-indigo-50"
                  >
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(cat._id)}
                      onChange={() => handleCategoryToggle(cat._id)}
                      className="form-checkbox h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-800">
                      {cat.name}
                    </span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
        <div className="flex w-full items-end gap-x-4 xl:flex-1 xl:w-auto">
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("description")}
            </label>
            <input
              type="text"
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder={t("search_by_description")}
            />
          </div>
          <div>
            <label
              htmlFor="date-filter-toggle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("date")}
            </label>
            <button
              id="date-filter-toggle"
              type="button"
              onClick={() => setIsDateSelectorVisible((prev) => !prev)}
              title={t("filter_by_date")}
              className={`cursor-pointer px-3 py-2 flex items-center justify-center border rounded-md shadow-sm transition duration-150 ease-in-out text-sm ${
                isDateSelectorVisible
                  ? "bg-indigo-100 border-indigo-500 text-indigo-600"
                  : isDateFilterActive
                  ? "bg-white border-indigo-400 text-indigo-600"
                  : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
              }`}
            >
              <CalendarDaysIcon className="h-5 w-5" />
            </button>
          </div>
          <CustomMultiSelectDropdown
            label={t("status")}
            options={statusOptions}
            selectedValues={status}
            onChange={(values) => setStatus(values as ICase["status"][])}
            placeholder="Всички"
          />
          <CustomDropdown
            label={"Прочетени"}
            options={readStatusOptions}
            value={readStatus === "" ? "ALL" : readStatus}
            onChange={(value) => setReadStatus(value as "READ" | "UNREAD" | "")}
          />
        </div>
      </div>

      {isDateSelectorVisible && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <DateRangeSelector
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            justify="end"
          />
        </div>
      )}
    </div>
  );
};

export default CaseSearchBar;
