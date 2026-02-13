import React, { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_LEAN_USERS } from "../../../graphql/query/user";
import { XMarkIcon } from "@heroicons/react/24/outline";
import UserAvatar from "../../cards/UserAvatar";

interface LeanUser {
  _id: string;
  name: string;
  username: string;
}

interface UserComboboxProps {
  selectedUserId: string;
  onSelect: (userId: string) => void;
  label?: string;
  placeholder?: string;
  allowUnassign?: boolean;
  unassignLabel?: string;
}

const UserCombobox: React.FC<UserComboboxProps> = ({
  selectedUserId,
  onSelect,
  label,
  placeholder = "Търси потребител...",
  allowUnassign = true,
  unassignLabel = "-- Без възложен --",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: leanUsersData } = useQuery(GET_LEAN_USERS);
  const users: LeanUser[] = leanUsersData?.getLeanUsers || [];

  const selectedUser = useMemo(
    () => users.find((u) => u._id === selectedUserId) || null,
    [users, selectedUserId],
  );

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (userId: string) => {
    onSelect(userId);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    onSelect("");
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Selected user display / search input */}
      {selectedUser && !isOpen ? (
        <div
          onClick={() => {
            setIsOpen(true);
            setSearchQuery("");
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <UserAvatar name={selectedUser.name} imageUrl={null} size={24} />
            <span className="truncate text-gray-800">{selectedUser.name}</span>
            <span className="text-gray-500 text-xs flex-shrink-0">
              ({selectedUser.username})
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar-xs"
        >
          {allowUnassign && (
            <button
              type="button"
              onMouseDown={() => handleSelect("")}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer ${
                !selectedUserId ? "bg-blue-50" : ""
              }`}
            >
              {unassignLabel}
            </button>
          )}
          {filteredUsers.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              Няма намерени потребители
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                type="button"
                key={user._id}
                onMouseDown={() => handleSelect(user._id)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 cursor-pointer ${
                  selectedUserId === user._id ? "bg-blue-100" : ""
                }`}
              >
                <UserAvatar name={user.name} imageUrl={null} size={24} />
                <span className="flex-1 truncate">{user.name}</span>
                <span className="text-gray-500 text-xs flex-shrink-0">
                  ({user.username})
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserCombobox;
