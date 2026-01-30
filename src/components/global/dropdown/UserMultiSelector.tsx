// src/components/global/UserMultiSelector.tsx

import React, { useState, useRef, useEffect, useMemo } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

// We'll define a lean user interface here. This can be moved to a shared types file.
interface ILeanUser {
  _id: string;
  name: string;
  username: string;
}

interface UserMultiSelectorProps {
  label: string;
  placeholder: string;
  selectedUserIds: string[];
  setSelectedUserIds: (ids: string[]) => void;
  availableUsers: ILeanUser[];
  userCache: Record<string, ILeanUser | undefined>;
  loading: boolean;
  error: any;
}

const UserMultiSelector: React.FC<UserMultiSelectorProps> = ({
  label,
  placeholder,
  selectedUserIds,
  setSelectedUserIds,
  availableUsers,
  userCache,
  loading,
  error,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const displayRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("dashboard");

  useEffect(() => {
    if (!isDropdownVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        displayRef.current &&
        !displayRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside, true);
  }, [isDropdownVisible]);

  const selectedUserNames = useMemo(() => {
    return selectedUserIds
      .map((id) => userCache[id]?.name)
      .filter(Boolean)
      .join(", ");
  }, [selectedUserIds, userCache]);

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = searchTerm.trim()
      ? availableUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : availableUsers;

    return [...filtered].sort((a, b) => {
      const aIsSelected = selectedUserIds.includes(a._id);
      const bIsSelected = selectedUserIds.includes(b._id);
      if (aIsSelected && !bIsSelected) return -1;
      if (!aIsSelected && bIsSelected) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [availableUsers, searchTerm, selectedUserIds]);

  const handleUserToggle = (userId: string) => {
    const newIds = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];
    setSelectedUserIds(newIds);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        <div
          ref={displayRef}
          onClick={() => setIsDropdownVisible(!isDropdownVisible)}
          className="bg-white w-full px-3 py-2 pr-14 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 sm:text-sm cursor-pointer truncate"
        >
          <span
            className={selectedUserNames ? "text-gray-900" : "text-gray-400"}
          >
            {selectedUserNames || placeholder}
          </span>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {selectedUserIds.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUserIds([]);
                setSearchTerm("");
              }}
              className="text-gray-500 hover:text-gray-700 p-1 pointer-events-auto cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}

          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              selectedUserIds.length > 0 ? "ml-1" : ""
            } ${isDropdownVisible ? "transform rotate-180" : ""}`}
          />
        </div>
      </div>

      {isDropdownVisible && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("search")}
              autoFocus
              className="w-full px-2 py-1 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>

          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {t("loading")}
            </div>
          ) : error ? (
            <div className="px-3 py-2 text-sm text-red-600">
              {t("error")}: {error.message}
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {t("no_users_found")}
            </div>
          ) : (
            filteredAndSortedUsers.map((user) => (
              <label
                key={user._id}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-indigo-50"
              >
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user._id)}
                  onChange={() => handleUserToggle(user._id)}
                  className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />

                <span className="ml-2 text-sm flex justify-between items-center w-full">
                  <span className="text-gray-800">{user.name}</span>

                  <span className="font-semibold text-gray-500">
                    {user.username}
                  </span>
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserMultiSelector;
