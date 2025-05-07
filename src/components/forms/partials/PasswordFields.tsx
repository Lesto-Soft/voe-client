// src/components/forms/partials/PasswordFields.tsx
import React from "react";

interface PasswordFieldsProps {
  isEditing: boolean;
  password?: string; // Only used in create mode
  setPassword?: (value: string) => void; // Only used in create mode
  confirmPassword?: string; // Only used in create mode
  setConfirmPassword?: (value: string) => void; // Only used in create mode
  newPassword?: string; // Only used in edit mode
  setNewPassword?: (value: string) => void; // Only used in edit mode
  confirmNewPassword?: string; // Only used in edit mode
  setConfirmNewPassword?: (value: string) => void; // Only used in edit mode
  errorPlaceholderClass: string;
  // Add t function if needed for labels/placeholders
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
  errorPlaceholderClass,
}) => {
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
              onChange={(e) => setPassword?.(e.target.value)} // Use optional chaining as props are conditional
              required={!isEditing}
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
          </div>
        </>
      ) : (
        <>
          {/* Edit Mode Passwords */}
          <div>
            <label
              htmlFor="newPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Потвърди нова парола"
            />
            <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
          </div>
        </>
      )}
    </>
  );
};

export default PasswordFields;
