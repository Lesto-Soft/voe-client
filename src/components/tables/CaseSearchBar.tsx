import React, { useState, useRef, useEffect, useMemo } from "react"; // Import useMemo
import { useLazyQuery } from "@apollo/client"; // Assuming Apollo Client
import { ICase, ICategory } from "../../db/interfaces";
import { GET_LEAN_USERS } from "../../graphql/query/user";
import { GET_ACTIVE_CATEGORIES } from "../../graphql/query/category";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline"; // Import icons
import DateRangeSelector from "../features/userAnalytics/DateRangeSelector";

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
  status: ICase["status"] | "";
  setStatus: (v: ICase["status"] | "") => void;
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
  dateRange,
  setDateRange,
  t,
}) => {
  // --- State for Creator Search ---
  const [creatorInput, setCreatorInput] = useState(""); // Input field value
  const [selectedCreator, setSelectedCreator] = useState<ILeanUser | null>(
    null
  );
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Dropdown visibility
  const [fetchedInitialCreator, setFetchedInitialCreator] = useState(false); // Flag to prevent re-fetching initial creator
  const creatorInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown itself

  // State to store the full list fetched from the server
  const [serverFetchedUsers, setServerFetchedUsers] = useState<ILeanUser[]>([]);

  // --- Debounce Creator Input ---
  // Delays triggering the filter fetch until user stops typing for 300ms

  // --- GraphQL Query for Users ---
  const [
    fetchUsers,
    { loading: loadingUsers, error: usersError, data: usersData },
  ] = useLazyQuery<{ getLeanUsers: ILeanUser[] }>(GET_LEAN_USERS, {
    onCompleted: (data) => {
      setServerFetchedUsers(data?.getLeanUsers || []);
    },
  });

  // --- Effect: Fetch initial creator name if creatorId is provided ---
  useEffect(() => {
    if (creatorId && !creatorInput && !fetchedInitialCreator) {
      fetchUsers({ variables: { userId: creatorId } });
      setFetchedInitialCreator(true);
      setIsDropdownVisible(false);
    }
  }, [creatorId, creatorInput, fetchedInitialCreator, fetchUsers]);

  // --- Effect: Populate input field after initial creator fetch ---
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

  // --- Effect: Handle clicks outside the creator input/dropdown ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        creatorInputRef.current &&
        !creatorInputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Event Handlers ---
  const handleCreatorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("Creator input changed:", newValue);
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
      console.log("Fetching all users on focus...");
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

  // Handler to clear the creator selection
  const clearCreatorSelection = () => {
    setCreatorId("");
    setCreatorInput("");
    setSelectedCreator(null);
    setFetchedInitialCreator(false);
    setIsDropdownVisible(false); // Optionally hide dropdown
    // Optionally refocus the input
    creatorInputRef.current?.focus();
    // Fetch all users again if desired after clearing
    // fetchUsers({ variables: { search: "" } });
  };

  // --- Client-side Filtering Logic ---
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

  // --- State for Category Search ---
  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] =
    useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [serverFetchedCategories, setServerFetchedCategories] = useState<
    ICategory[]
  >([]);
  const [categorySearch, setCategorySearch] = useState(""); // For filtering in dropdown

  // --- GraphQL Query for Categories ---
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

  // Fetch categories on component mount if categoryIds are provided from URL
  useEffect(() => {
    if (categoryIds.length > 0 && serverFetchedCategories.length === 0) {
      fetchCategories();
    }
  }, [categoryIds, serverFetchedCategories.length, fetchCategories]);

  // Fetch categories on dropdown open if not already fetched
  useEffect(() => {
    if (isCategoryDropdownVisible && serverFetchedCategories.length === 0) {
      fetchCategories();
    }
  }, [
    isCategoryDropdownVisible,
    serverFetchedCategories.length,
    fetchCategories,
  ]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target as Node) &&
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered categories for dropdown
  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    return serverFetchedCategories.filter((cat) =>
      cat.name.toLowerCase().includes(search)
    );
  }, [serverFetchedCategories, categorySearch]);

  // Display selected categories as comma-separated names
  const selectedCategoryNames = useMemo(() => {
    return serverFetchedCategories
      .filter((cat) => categoryIds.includes(cat._id))
      .map((cat) => cat.name)
      .join(", ");
  }, [categoryIds, serverFetchedCategories]);

  // Handle checkbox toggle
  const handleCategoryToggle = (catId: string) => {
    if (categoryIds.includes(catId)) {
      setCategoryIds(categoryIds.filter((id) => id !== catId));
    } else {
      setCategoryIds([...categoryIds, catId]);
    }
  };

  // Handle input click to open/close dropdown
  const handleCategoryInputClick = () => {
    setIsCategoryDropdownVisible((v) => !v);
  };

  // Handle search in dropdown
  const handleCategorySearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCategorySearch(e.target.value);
  };

  // --- Render Logic ---
  const showDropdown = isDropdownVisible;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5">
      <div className="mb-4">
        <DateRangeSelector
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

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

        {/* Priority */}
        <div className="group relative">
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("priority")}
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as ICase["priority"] | "");
              (e.target as HTMLSelectElement).blur();
            }}
            className="w-32 pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white appearance-none truncate"
          >
            <option value=""> {t("all")}</option>
            <option value="LOW"> {t("LOW")}</option>
            <option value="MEDIUM"> {t("MEDIUM")}</option>
            <option value="HIGH"> {t("HIGH")}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 top-[calc(1.75rem+1px)]">
            <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 ease-in-out group-focus-within:rotate-180" />
          </div>
        </div>

        {/* Type */}
        <div className="group relative">
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("type")}
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as ICase["type"] | "");
              (e.target as HTMLSelectElement).blur();
            }}
            className="w-32 pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white appearance-none truncate"
          >
            <option value=""> {t("all")}</option>
            <option value="PROBLEM"> {t("PROBLEM")}</option>
            <option value="SUGGESTION"> {t("SUGGESTION")}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 top-[calc(1.75rem+1px)]">
            <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 ease-in-out group-focus-within:rotate-180" />
          </div>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <label
            htmlFor="creator"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("creator")}
          </label>
          {selectedCreator ? (
            <div className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm flex justify-between items-center h-[38px]">
              <span className="text-gray-800">{selectedCreator.name}</span>
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
              className="bg-white w-full px-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder={t("choose_creator")}
              autoComplete="off"
            />
          )}
          {/* Clear Button */}
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
                      <span className="text-gray-800">{user.name}</span>
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

        {/* Category (Checkbox Multi-Select Dropdown) */}
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

        {/* Content */}
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

        {/* Status */}
        <div className="group relative">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("status")}
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ICase["status"] | "");
              (e.target as HTMLSelectElement).blur();
            }}
            className="w-32 pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white appearance-none truncate"
          >
            <option value=""> {t("all")}</option>
            <option value="OPEN"> {t("OPEN")}</option>
            <option value="IN_PROGRESS"> {t("IN_PROGRESS")}</option>
            <option value="AWAITING_FINANCE"> {t("AWAITING_FINANCE")}</option>
            <option value="CLOSED"> {t("CLOSED")}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 top-[calc(1.75rem+1px)]">
            <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 ease-in-out group-focus-within:rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseSearchBar;
