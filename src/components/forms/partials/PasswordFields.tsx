// src/components/forms/partials/PasswordFields.tsx
import React from "react";

interface PasswordFieldsProps {
  isEditing: boolean;
  password?: string;
  setPassword?: (value: string) => void;
  confirmPassword?: string;
  setConfirmPassword?: (value: string) => void;
  newPassword?: string;
  setNewPassword?: (value: string) => void;
  confirmNewPassword?: string;
  setConfirmNewPassword?: (value: string) => void;
  passwordError: string | null; // ADDED: To display validation errors for passwords
  errorPlaceholderClass: string;
}

const PasswordFields: React.FC<PasswordFieldsProps> = ({
  isEditing,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  passwordError, // ADDED
  errorPlaceholderClass,
}) => {
  const newPasswordFullLabel =
    "Нова парола (оставете празно, ако не променяте)";

  return (
    <>
      {!isEditing ? (
        <>
          {/* Create Mode Passwords */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Парола<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword?.(e.target.value)}
              required={!isEditing}
              className={`w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 ${
                passwordError ? "border-red-500" : "border-gray-300" // MODIFIED
              }`}
            />
            <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Повтори парола<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword?.(e.target.value)}
              required={!isEditing}
              className={`w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 ${
                passwordError ? "border-red-500" : "border-gray-300" // MODIFIED
              }`}
            />
            {/* MODIFIED: Display passwordError */}
            <p
              className={`${errorPlaceholderClass} ${
                passwordError ? "text-red-500" : ""
              }`}
            >
              {passwordError || <>&nbsp;</>}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Edit Mode Passwords */}
          <div>
            <label
              htmlFor="newPassword"
              className="mb-1 block text-sm font-medium text-gray-700 truncate"
              title={newPasswordFullLabel}
            >
              Нова парола{" "}
              <span className="text-xs text-gray-500">
                (оставете празно, ако не променяте)
              </span>
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword?.(e.target.value)}
              className={`w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 ${
                passwordError ? "border-red-500" : "border-gray-300" // MODIFIED
              }`}
              placeholder="Нова парола"
            />
            <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
          </div>
          <div>
            <label
              htmlFor="confirmNewPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Потвърди нова парола
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword?.(e.target.value)}
              className={`w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 ${
                passwordError ? "border-red-500" : "border-gray-300" // MODIFIED
              }`}
              placeholder="Потвърди нова парола"
            />
            {/* MODIFIED: Display passwordError */}
            <p
              className={`${errorPlaceholderClass} ${
                passwordError ? "text-red-500" : ""
              }`}
            >
              {passwordError || <>&nbsp;</>}
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default PasswordFields;
