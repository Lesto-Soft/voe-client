// src/components/forms/partials/UserInputFields.tsx
import React from "react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Role } from "../../../types/userManagementTypes";

interface UserInputFieldsProps {
  username: string;
  setUsername: (value: string) => void;
  usernameError: string | null;
  isCheckingUsername: boolean;
  fullName: string;
  setFullName: (value: string) => void;
  nameError: string | null;
  email: string;
  setEmail: (value: string) => void;
  emailError: string | null;
  isCheckingEmail: boolean;
  isEmailFormatCurrentlyValid: boolean;
  trimmedDebouncedEmail: string;
  position: string;
  setPosition: (value: string) => void;
  positionError: string | null; // <-- NEW
  roleId: string;
  onRoleChange: (value: string) => void;
  roleError: string | null; // <-- ADDED
  roles: Role[];
  financialApprover: boolean;
  setFinancialApprover: (value: boolean) => void;
  errorPlaceholderClass: string;
  isEditing: boolean;
  isAdmin: boolean;
}

const UserInputFields: React.FC<UserInputFieldsProps> = ({
  username,
  setUsername,
  usernameError,
  isCheckingUsername,
  fullName,
  setFullName,
  nameError,
  email,
  setEmail,
  emailError,
  isCheckingEmail,
  isEmailFormatCurrentlyValid,
  trimmedDebouncedEmail,
  position,
  setPosition,
  positionError, // <-- NEW
  roleId,
  onRoleChange,
  roleError, // <-- ADDED
  roles,
  financialApprover,
  setFinancialApprover,
  errorPlaceholderClass,
  isEditing,
  isAdmin,
}) => {
  const roleChangeWarningText =
    "ВНИМАНИЕ: Промяна на ролята ОТ Админ или Експерт КЪМ Базов или Напуснал, ЩЕ ПРЕМАХНЕ потребителя от категориите, за които е експерт и/или мениджър.";

  const canEditSensitiveFields = isAdmin;
  const isUsernameDisabled = isEditing && !isAdmin;

  const disabledClasses =
    "disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <Tooltip.Provider delayDuration={300}>
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
            disabled={isUsernameDisabled}
            className={`w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 ${
              usernameError ? "border-red-500" : "border-gray-300"
            } ${
              isCheckingUsername ? "opacity-70 animate-pulse" : ""
            } ${disabledClasses}`}
          />
          <p
            className={`${errorPlaceholderClass} ${
              usernameError ? "text-red-500" : "text-blue-500"
            }`}
          >
            {isCheckingUsername ? (
              "Проверка на потребителско име..."
            ) : usernameError ? (
              usernameError
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
            className={`w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 ${
              nameError ? "border-red-500" : "border-gray-300"
            } ${disabledClasses}`}
          />
          <p
            className={`${errorPlaceholderClass} ${
              nameError ? "text-red-500" : ""
            }`}
          >
            {nameError || <>&nbsp;</>}
          </p>
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
            className={`w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 ${
              emailError ? "border-red-500" : "border-gray-300"
            } ${
              isCheckingEmail &&
              trimmedDebouncedEmail &&
              isEmailFormatCurrentlyValid
                ? "opacity-70 animate-pulse"
                : ""
            } ${disabledClasses}`}
          />
          <p
            className={`${errorPlaceholderClass} ${
              emailError ? "text-red-500" : "text-blue-500"
            }`}
          >
            {isCheckingEmail &&
            trimmedDebouncedEmail &&
            isEmailFormatCurrentlyValid ? (
              "Проверка на имейл..."
            ) : emailError ? (
              emailError
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
            className={`w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 ${
              positionError ? "border-red-500" : "border-gray-300"
            } ${disabledClasses}`}
          />
          <p
            className={`${errorPlaceholderClass} ${
              positionError ? "text-red-500" : ""
            }`}
          >
            {positionError || <>&nbsp;</>}
          </p>
        </div>

        {/* Combined Row for Role and Financial Approver */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {/* Role Input */}
            <div>
              <div className="flex items-center mb-1 space-x-1">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Роля<span className="text-red-500">*</span>
                </label>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      type="button"
                      className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <InformationCircleIcon
                        className="h-5 w-5 text-yellow-500 hover:text-yellow-700"
                        aria-hidden="true"
                      />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      sideOffset={5}
                      className="z-50 max-w-xs bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded-md shadow-lg text-sm"
                    >
                      {roleChangeWarningText}
                      <Tooltip.Arrow className="fill-yellow-100" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
              <select
                id="role"
                name="role"
                value={roleId}
                onChange={(e) => onRoleChange(e.target.value)}
                required
                disabled={!canEditSensitiveFields}
                className={`cursor-pointer w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 ${disabledClasses} ${
                  roleError ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Изберете роля</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                  </option>
                ))}
              </select>
              <p
                className={`${errorPlaceholderClass} ${
                  roleError ? "text-red-500" : ""
                }`}
              >
                {roleError || <>&nbsp;</>}
              </p>
            </div>

            {/* Financial Approver Checkbox */}
            <div>
              <label className="mb-1 block text-sm font-medium text-transparent select-none">
                &nbsp;
              </label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  id="financial_approver"
                  name="financial_approver"
                  checked={financialApprover}
                  onChange={(e) => setFinancialApprover(e.target.checked)}
                  disabled={!canEditSensitiveFields}
                  className={`cursor-pointer h-5 w-5 rounded border-gray-300 text-blue-600 shadow-sm focus:outline-none focus:border-indigo-500 ${disabledClasses}`}
                />
                <label
                  htmlFor="financial_approver"
                  className="cursor-pointer ml-2 text-sm font-medium text-gray-700"
                >
                  Финансов Одобрител
                </label>
              </div>
              <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
            </div>
          </div>
        </div>
      </>
    </Tooltip.Provider>
  );
};

export default UserInputFields;
