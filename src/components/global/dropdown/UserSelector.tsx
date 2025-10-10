// src/components/global/UserSelector.tsx

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_LEAN_USERS } from "../../../graphql/query/user";
import { XMarkIcon } from "@heroicons/react/24/outline";

// This interface can be moved to a shared types file if used elsewhere
interface ILeanUser {
  _id: string;
  name: string;
  username: string;
}

interface UserSelectorProps {
  label: string;
  placeholder: string;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  t: (key: string) => string;
  queryVariables?: object; // Prop to filter users (e.g., { isManager: true })
}

const UserSelector: React.FC<UserSelectorProps> = ({
  label,
  placeholder,
  selectedUserId,
  setSelectedUserId,
  t,
  queryVariables = {}, // Default to an empty object
}) => {
  const [userInput, setUserInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<ILeanUser | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [fetchedInitialUser, setFetchedInitialUser] = useState(false);
  const [serverFetchedUsers, setServerFetchedUsers] = useState<ILeanUser[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [
    fetchUsers,
    { loading: loadingUsers, error: usersError, data: usersData },
  ] = useLazyQuery<{ getLeanUsers: ILeanUser[] }>(GET_LEAN_USERS, {
    onCompleted: (data) => {
      setServerFetchedUsers(data?.getLeanUsers || []);
    },
  }); // Effect to fetch the user details if an initial ID is provided

  useEffect(() => {
    if (selectedUserId && !userInput && !fetchedInitialUser) {
      fetchUsers({ variables: { ...queryVariables, userId: selectedUserId } });
      setFetchedInitialUser(true);
      setIsDropdownVisible(false);
    }
  }, [
    selectedUserId,
    userInput,
    fetchedInitialUser,
    fetchUsers,
    queryVariables,
  ]);

  // Effect to set the input text once the initial user is fetched
  useEffect(() => {
    if (fetchedInitialUser && !userInput && usersData?.getLeanUsers) {
      const initialUser = usersData.getLeanUsers.find(
        (u) => u._id === selectedUserId
      );
      if (initialUser) {
        setSelectedUser(initialUser);
        setUserInput(`${initialUser.name} (${initialUser.username})`);
        setIsDropdownVisible(false);
        setServerFetchedUsers(usersData.getLeanUsers);
      } else {
        setSelectedUserId("");
        setFetchedInitialUser(false);
        setSelectedUser(null);
      }
    }
  }, [
    usersData,
    fetchedInitialUser,
    selectedUserId,
    userInput,
    setSelectedUserId,
  ]);

  // Effect to clear local state if the parent clears the ID
  useEffect(() => {
    if (!selectedUserId) {
      setUserInput("");
      setSelectedUser(null);
      setFetchedInitialUser(false);
    }
  }, [selectedUserId]);

  // Effect for handling clicks outside the component to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
        if (!selectedUserId) {
          setUserInput("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUserInput(newValue);
    if (selectedUserId) {
      setSelectedUserId("");
      setSelectedUser(null);
    }
    setFetchedInitialUser(false);
    setIsDropdownVisible(true);
    fetchUsers({ variables: { ...queryVariables, search: newValue } });
  };

  const handleInputFocus = () => {
    setIsDropdownVisible(true);
    if (userInput === "" && !fetchedInitialUser) {
      fetchUsers({ variables: { ...queryVariables, search: "" } });
    }
  };

  const handleUserSelect = (user: ILeanUser) => {
    setSelectedUserId(user._id);
    setSelectedUser(user);
    setUserInput(`${user.name} (${user.username})`);
    setIsDropdownVisible(false);
    setFetchedInitialUser(true);
  };

  const clearSelection = () => {
    setSelectedUserId("");
    inputRef.current?.focus();
  };

  const handleReopenDropdown = () => {
    setSelectedUserId(""); // This clears the selection and allows re-searching
    setIsDropdownVisible(true);
    if (serverFetchedUsers.length === 0) {
      fetchUsers({ variables: { ...queryVariables, search: "" } });
    }
  };

  const filteredDisplayUsers = useMemo(() => {
    if (!userInput) return serverFetchedUsers;
    const lowerCaseInput = userInput.toLowerCase();
    return serverFetchedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerCaseInput) ||
        user.username.toLowerCase().includes(lowerCaseInput)
    );
  }, [userInput, serverFetchedUsers]);

  return (
    <div className="relative flex-1 min-w-[200px]">
      <label
        htmlFor="user-selector"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>

      {selectedUser ? (
        <div
          onClick={handleReopenDropdown}
          className="cursor-pointer bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm flex justify-between items-center"
        >
          <span
            className="text-gray-800 truncate max-w-[170px]"
            title={selectedUser.name}
          >
            {selectedUser.name}
          </span>

          <span className="font-semibold text-gray-500 mr-6">
            {selectedUser.username}
          </span>
        </div>
      ) : (
        <input
          type="text"
          id="user-selector"
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="cursor-pointer bg-white w-full px-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          placeholder={placeholder}
          autoComplete="off"
        />
      )}

      {selectedUserId && (
        <button
          type="button"
          onClick={clearSelection}
          className="mt-6 absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 hover:text-gray-900 focus:outline-none cursor-pointer"
          title={t("clear")}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}

      {isDropdownVisible && !selectedUser && (
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
        </div>
      )}
    </div>
  );
};

export default UserSelector;
