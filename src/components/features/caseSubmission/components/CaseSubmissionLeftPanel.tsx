// src/components/features/caseSubmission/components/CaseSubmissionLeftPanel.tsx
import React, { ChangeEvent } from "react";
import { TFunction } from "i18next";
import { ApolloError } from "@apollo/client";
import TextEditor from "../../../forms/partials/TextEditor/TextEditor";
import { CASE_CONTENT } from "../../../../utils/GLOBAL_PARAMETERS";
import { CreateCaseMutationInput } from "../types";

interface CaseSubmissionLeftPanelProps {
  t: TFunction<"caseSubmission", undefined>;
  usernameInput: string;
  handleUsernameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isUserLoading: boolean;
  userLookupError: ApolloError | undefined;
  notFoundUsername: string | null;
  fetchedName: string;
  content: string;
  onContentChange: (value: string) => void;
  priority: CreateCaseMutationInput["priority"];
  onPriorityChange: (priority: CreateCaseMutationInput["priority"]) => void;
}

const CaseSubmissionLeftPanel: React.FC<CaseSubmissionLeftPanelProps> = ({
  t,
  usernameInput,
  handleUsernameChange,
  isUserLoading,
  userLookupError,
  notFoundUsername,
  fetchedName,
  content,
  onContentChange,
  priority,
  onPriorityChange,
}) => {
  const priorityOptions = [
    { labelKey: "caseSubmission.priority.low", value: "LOW", color: "#009b00" },
    {
      labelKey: "caseSubmission.priority.medium",
      value: "MEDIUM",
      color: "#ad8600",
    },
    {
      labelKey: "caseSubmission.priority.high",
      value: "HIGH",
      color: "#c30505",
    },
  ];

  return (
    <div className="rounded-2xl shadow-md bg-white p-6 h-full space-y-4">
      <div className="flex flex-col md:flex-row md:gap-x-4 space-y-4 md:space-y-0">
        <div className="flex-1">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("caseSubmission.usernameLabel")}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="username"
            placeholder={t("caseSubmission.usernamePlaceholder")}
            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:border-indigo-500 "
            name="username"
            aria-label={t("caseSubmission.usernameLabel")}
            value={usernameInput}
            onChange={handleUsernameChange}
          />
          <div className="h-5 mt-1">
            {isUserLoading && (
              <p className="text-sm text-gray-500 animate-pulse">
                {t("caseSubmission.userSearchLoading")}
              </p>
            )}
            {userLookupError && (
              <p className="text-sm text-red-500">
                {t("caseSubmission.userSearchError", {
                  message: userLookupError.message,
                })}
              </p>
            )}
            <p
              className={`text-sm text-red-500 transition-opacity duration-200 ${
                notFoundUsername ? "opacity-100" : "opacity-0"
              }`}
            >
              {notFoundUsername
                ? t("caseSubmission.userNotFoundError", {
                    username: notFoundUsername,
                  })
                : "\u00A0"}
            </p>
          </div>
        </div>
        <div className="flex-1">
          <label
            htmlFor="fullname"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("caseSubmission.fullNameLabel")}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullname"
            placeholder={t("caseSubmission.fullNamePlaceholder")}
            className="w-full border border-gray-300 p-3 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-0"
            name="fullname"
            aria-label={t("caseSubmission.fullNameLabel")}
            value={fetchedName}
            disabled
            readOnly
          />
          <div className="h-5 mt-1"></div>
        </div>
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t("caseSubmission.descriptionLabel")}
          <span className="text-red-500">*</span>
        </label>
        <TextEditor
          content={content}
          onUpdate={onContentChange}
          placeholder={t("caseSubmission.descriptionPlaceholder")}
          editable={true}
          height="15rem"
          maxLength={CASE_CONTENT.MAX}
          minLength={CASE_CONTENT.MIN}
          wrapperClassName="w-full rounded-md shadow-sm overflow-hidden bg-white"
          autoFocus={true}
        />
      </div>
      <div>
        <p className="text-sm font-medium mb-3 mt-6 text-gray-700">
          {t("caseSubmission.priorityLabel")}
          <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {priorityOptions.map(({ labelKey, value, color }) => (
            <label
              key={value}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
            >
              <input
                type="radio"
                value={value}
                checked={priority === value}
                onChange={(e) =>
                  onPriorityChange(
                    e.target.value as CreateCaseMutationInput["priority"]
                  )
                }
                style={{ accentColor: color }}
                className="w-5 h-5 cursor-pointer"
                name="priority"
              />
              <span className="text-sm text-gray-700">{t(labelKey)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseSubmissionLeftPanel;
