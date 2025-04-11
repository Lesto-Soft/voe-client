// src/components/case/CaseFormLeftPanel.tsx
import React, { ChangeEvent } from "react";
import { ApolloError } from "@apollo/client";
// Import necessary types, constants directly or via props type
import { CaseFormLeftPanelProps } from "../../types/CaseSubmittionTypes"; // Adjust path

export const CaseFormLeftPanel: React.FC<CaseFormLeftPanelProps> = ({
  usernameInput,
  handleUsernameChange,
  userLoading,
  userError,
  usernameError,
  notFoundUsername,
  fetchedName,
  content,
  handleContentChange,
  contentError,
  attachments,
  handleFileChange,
  handleRemoveAttachment,
  fileError,
  maxFiles,
  maxFileSizeMB,
}) => {
  return (
    <div className="rounded-2xl shadow-md bg-white p-6 min-h-96">
      {" "}
      {/* Use desired min-h */}
      <div className="space-y-4">
        {/* --- Row for Username and Name --- */}
        <div className="flex flex-col md:flex-row md:gap-x-4 space-y-4 md:space-y-0">
          {/* Username Input Column */}
          <div className="flex-1">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Потребителско име*
            </label>
            <input
              type="text"
              id="username"
              placeholder="emp###..."
              name="username"
              className={`w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                usernameError ? "border-red-500" : "border-gray-300"
              }`}
              aria-label="Потребителско име"
              aria-invalid={!!usernameError}
              aria-describedby={
                usernameError || notFoundUsername
                  ? "username-feedback"
                  : undefined
              }
              value={usernameInput}
              onChange={handleUsernameChange}
            />
          </div>
          {/* Name Input Column */}
          <div className="flex-1">
            <label
              htmlFor="fullname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Име и фамилия*
            </label>
            <input
              type="text"
              id="fullname"
              placeholder="(автоматично)"
              name="fullname"
              className="w-full border border-gray-300 p-3 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-0"
              aria-label="Име и фамилия"
              value={fetchedName}
              disabled
              readOnly
            />
          </div>
        </div>
        {/* --- End Row --- */}

        {/* --- Username Feedback Area --- */}
        <div className="h-5 mt-1">
          {userLoading && (
            <p className="text-sm text-gray-500 animate-pulse">Търсене...</p>
          )}
          {!userLoading && userError && (
            <p className="text-sm text-red-500">
              Грешка (търсене): {userError.message}
            </p>
          )}
          {!userLoading && !userError && (
            <p
              id="username-feedback"
              className={`text-sm transition-opacity duration-200 ${
                usernameError
                  ? "text-red-500 opacity-100"
                  : notFoundUsername
                  ? "text-orange-500 opacity-100"
                  : "opacity-0"
              }`}
            >
              {usernameError || notFoundUsername || "\u00A0"}
            </p>
          )}
        </div>
        {/* --- End Feedback Area --- */}

        {/* Description Textarea Section */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Описание*
          </label>
          <textarea
            id="description"
            placeholder="Описание..."
            aria-invalid={!!contentError}
            aria-describedby={contentError ? "content-error" : undefined}
            className={`w-full h-40 border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              contentError ? "border-red-500" : "border-gray-300"
            }`}
            name="description"
            value={content}
            onChange={handleContentChange}
            maxLength={500}
            aria-label="Описание на сигнала"
          />
          <div className="h-5 mt-1">
            <p
              id="content-error"
              className={`text-sm text-red-500 transition-opacity duration-200 ${
                contentError ? "opacity-100" : "opacity-0"
              }`}
            >
              {contentError || "\u00A0"}
            </p>
          </div>
        </div>

        {/* File Input Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Прикачени файлове ({attachments.length} / {maxFiles}) (макс.{" "}
            {maxFileSizeMB} MB всеки)
          </label>
          <label
            htmlFor="file-upload-input"
            className={`w-full text-center inline-block rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm ${
              attachments.length >= maxFiles
                ? "opacity-75 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            }`}
            onClick={(e) => {
              if (attachments.length >= maxFiles) e.preventDefault();
            }}
          >
            📎 Избери файлове
          </label>
          <input
            id="file-upload-input"
            name="attachments"
            type="file"
            multiple
            onChange={handleFileChange}
            className="sr-only"
            disabled={attachments.length >= maxFiles}
          />
          {/* Display File Errors */}
          <div className="h-5 mt-1">
            <p
              className={`text-sm text-red-500 transition-opacity duration-200 ${
                fileError ? "opacity-100" : "opacity-0"
              }`}
            >
              {fileError || "\u00A0"}
            </p>
          </div>
          {/* Container for Selected Files List */}
          <div className="mt-2 min-h-[3rem]">
            {attachments.length > 0 && (
              <div className="text-sm text-gray-600 space-y-1 h-36 max-h-36 overflow-y-scroll border border-gray-200 rounded p-2 bg-gray-50 pr-2">
                <p className="font-medium mb-1 sticky top-0 bg-gray-50 pt-1 pb-1 z-10">
                  Добавени файлове:
                </p>
                <ul className="list-none pl-1 space-y-1">
                  {attachments.map((file) => (
                    <li
                      key={file.name + "-" + file.lastModified}
                      className="flex justify-between items-center group p-1 rounded hover:bg-gray-200 relative"
                    >
                      <span
                        className="truncate pr-2 group-hover:underline"
                        title={file.name}
                      >
                        {file.name}{" "}
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(file.name)}
                        className="flex-shrink-0 ml-2 px-1.5 py-0.5 text-red-500 hover:text-red-700 text-lg font-bold leading-none rounded focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
                        aria-label={`Премахни файл ${file.name}`}
                        title="Премахни файл"
                      >
                        {" "}
                        &times;{" "}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {attachments.length === 0 && (
              <div className="h-36 border border-transparent rounded p-2"></div>
            )}
          </div>
        </div>
        {/* --- End File Input Section --- */}
      </div>
    </div>
  );
};
