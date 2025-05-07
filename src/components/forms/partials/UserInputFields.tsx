// src/components/forms/partials/UserInputFields.tsx
import React from "react";
import { Role } from "../../../page/types/userManagementTypes"; // Adjust path

interface UserInputFieldsProps {
  username: string;
  setUsername: (value: string) => void;
  usernameError: string | null;
  usernameHookError: any | null;
  isCheckingUsername: boolean;
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  emailError: string | null;
  emailHookError: any | null;
  isCheckingEmail: boolean;
  isEmailFormatCurrentlyValid: boolean; // Needed for loading indicator logic
  trimmedDebouncedEmail: string; // Needed for loading indicator logic
  position: string;
  setPosition: (value: string) => void;
  roleId: string;
  setRoleId: (value: string) => void;
  roles: Role[];
  errorPlaceholderClass: string;
  // Add t function if needed for labels/placeholders
}

const UserInputFields: React.FC<UserInputFieldsProps> = ({
  username,
  setUsername,
  usernameError,
  usernameHookError,
  isCheckingUsername,
  fullName,
  setFullName,
  email,
  setEmail,
  emailError,
  emailHookError,
  isCheckingEmail,
  isEmailFormatCurrentlyValid,
  trimmedDebouncedEmail,
  position,
  setPosition,
  roleId,
  setRoleId,
  roles,
  errorPlaceholderClass,
}) => {
  return (
    <>
      {/* Username Input */}
      <div>
        <label
          htmlFor="username"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Потребителско име<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={`w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            usernameError || usernameHookError
              ? "border-red-500"
              : "border-gray-300"
          } ${isCheckingUsername ? "opacity-70 animate-pulse" : ""}`}
        />
        <p
          className={`${errorPlaceholderClass} ${
            usernameError || usernameHookError
              ? "text-red-500"
              : "text-blue-500"
          }`}
        >
          {isCheckingUsername ? (
            "Проверка на потребителско име..."
          ) : usernameError ? (
            usernameError
          ) : usernameHookError ? (
            usernameHookError.message ||
            "Грешка от сървъра при проверка на потребителско име."
          ) : (
            <>&nbsp;</>
          )}
        </p>
      </div>

      {/* Full Name Input */}
      <div>
        <label
          htmlFor="fullName"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Име и фамилия<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
      </div>

      {/* Email Input - Optional */}
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Имейл
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            emailError || emailHookError ? "border-red-500" : "border-gray-300"
          } ${
            isCheckingEmail &&
            trimmedDebouncedEmail &&
            isEmailFormatCurrentlyValid
              ? "opacity-70 animate-pulse"
              : ""
          }`}
        />
        <p
          className={`${errorPlaceholderClass} ${
            emailError || emailHookError ? "text-red-500" : "text-blue-500"
          }`}
        >
          {isCheckingEmail &&
          trimmedDebouncedEmail &&
          isEmailFormatCurrentlyValid ? (
            "Проверка на имейл..."
          ) : emailError ? (
            emailError
          ) : emailHookError ? (
            emailHookError.message || "Грешка от сървъра при проверка на имейл."
          ) : (
            <>&nbsp;</>
          )}
        </p>
      </div>

      {/* Position Input */}
      <div>
        <label
          htmlFor="position"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Позиция
        </label>
        <input
          type="text"
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
      </div>

      {/* Role Input */}
      <div>
        <label
          htmlFor="role"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Роля<span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          name="role"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          required
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Изберете роля</option>
          {roles.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
            </option>
          ))}
        </select>
        <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
      </div>
    </>
  );
};

export default UserInputFields;
