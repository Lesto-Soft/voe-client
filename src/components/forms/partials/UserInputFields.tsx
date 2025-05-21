// src/components/forms/partials/UserInputFields.tsx
import React from "react";
import { Role } from "../../../types/userManagementTypes"; // Adjust path

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
  financialApprover: boolean;
  setFinancialApprover: (value: boolean) => void;
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
  financialApprover,
  setFinancialApprover,
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

      {/* Combined Row for Role and Financial Approver */}
      {/* This div is part of the natural flow of UserInputFields.
          Its children (Role and Financial Approver) will be laid out side-by-side on medium screens and up.
      */}
      <div>
        {" "}
        {/* Wrapper for the row of Role and Financial Approver */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
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

          {/* Financial Approver Checkbox */}
          {/* This div will be the second column in the md:grid-cols-2 */}
          <div>
            {/* Invisible label for spacing to align with Role input's label visually */}
            <label className="mb-1 block text-sm font-medium text-transparent select-none">
              &nbsp; {/* Placeholder for alignment */}
            </label>
            <div className="flex items-center h-10">
              {" "}
              {/* Adjust h-10 to match input height of select (p-2 + border) */}
              <input
                type="checkbox"
                id="financial_approver"
                name="financial_approver"
                checked={financialApprover}
                onChange={(e) => setFinancialApprover(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
              />
              <label
                htmlFor="financial_approver"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Финансов Одобрител
              </label>
            </div>
            <p className={`${errorPlaceholderClass}`}>&nbsp;</p>{" "}
            {/* For consistent bottom spacing */}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserInputFields;
