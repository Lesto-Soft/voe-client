import React from "react";
import { TFunction } from "i18next";
import TextEditorWithAttachments from "./TextEditor/TextEditorWithAttachments";
import { usePastedAttachments } from "../hooks/usePastedAttachments";
import { CASE_CONTENT } from "../../../utils/GLOBAL_PARAMETERS";

interface ContentWithAttachmentsFieldProps {
  content: string;
  onContentChange: (html: string) => void;
  newAttachments: File[];
  setNewAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  existingAttachments?: string[];
  setExistingAttachments?: React.Dispatch<React.SetStateAction<string[]>>;
  isCompressing: boolean;
  processFiles: (files: File[]) => Promise<File[]>;
  t: TFunction;
  isOpen: boolean;
  caseId?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  editorHeight?: string;
  mentions?: { name: string; username: string; _id: string }[];
}

const ContentWithAttachmentsField: React.FC<
  ContentWithAttachmentsFieldProps
> = ({
  content,
  onContentChange,
  newAttachments,
  setNewAttachments,
  existingAttachments = [],
  setExistingAttachments,
  isCompressing,
  processFiles,
  t,
  isOpen,
  caseId,
  label,
  placeholder,
  required = true,
  editorHeight = "150px",
  mentions,
}) => {
  usePastedAttachments(
    isOpen,
    newAttachments,
    existingAttachments,
    setNewAttachments,
    t
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <TextEditorWithAttachments
        content={content}
        onUpdate={onContentChange}
        placeholder={
          placeholder ||
          t("caseSubmission.content.placeholder", "Опишете вашия случай...")
        }
        editable={!isCompressing}
        height={editorHeight}
        maxLength={CASE_CONTENT.MAX}
        minLength={CASE_CONTENT.MIN}
        autoFocus={true}
        newAttachments={newAttachments}
        setNewAttachments={setNewAttachments}
        existingAttachments={existingAttachments}
        setExistingAttachments={setExistingAttachments}
        caseId={caseId}
        processFiles={processFiles}
        isCompressing={isCompressing}
        mentions={mentions}
      />
    </div>
  );
};

export default ContentWithAttachmentsField;
