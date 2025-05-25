// src/features/caseSubmission/components/CaseSubmissionLeftPanel.tsx
import React, { ChangeEvent } from "react";
import { TFunction } from "i18next"; // Import TFunction from i18next
import { ApolloError } from "@apollo/client"; // Import ApolloError
import FileAttachmentBtn from "../../../global/FileAttachmentBtn"; // Adjusted path

interface CaseSubmissionLeftPanelProps {
  t: TFunction<"caseSubmission", undefined>; // Expecting the namespaced t
  usernameInput: string;
  handleUsernameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isUserLoading: boolean;
  userLookupError: ApolloError | undefined;
  notFoundUsername: string | null;
  fetchedName: string;
  content: string;
  onContentChange: (value: string) => void;
  attachments: File[];
  onAttachmentsChange: React.Dispatch<React.SetStateAction<File[]>>;
  clearAllFormErrors?: () => void;
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
  attachments,
  onAttachmentsChange,
  clearAllFormErrors,
}) => {
  return (
    <div className="rounded-2xl shadow-md bg-white p-6 min-h-96">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:gap-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("caseSubmission.usernameLabel")}
            </label>
            <input
              type="text"
              id="username"
              placeholder={t("caseSubmission.usernamePlaceholder")}
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                className={`text-sm text-orange-500 transition-opacity duration-200 ${
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
          </label>
          <textarea
            id="description"
            placeholder={t("caseSubmission.descriptionPlaceholder")}
            className="w-full h-40 border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            name="description"
            value={content}
            onChange={(e) => {
              if (clearAllFormErrors) clearAllFormErrors();
              onContentChange(e.target.value);
            }}
            maxLength={500}
            aria-label={t("caseSubmission.descriptionLabel")}
          />
        </div>
        <FileAttachmentBtn
          attachments={attachments}
          setAttachments={onAttachmentsChange}
        />
      </div>
    </div>
  );
};

export default CaseSubmissionLeftPanel;
