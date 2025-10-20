// src/components/forms/partials/TextEditor/TextEditorWithAttachments.tsx

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { createMentionSuggestion } from "../TextEditor/MentionSuggestion";
import { getTextLength } from "../../../../utils/contentRenderer";
import { MAX_UPLOAD_FILES, MAX_UPLOAD_MB } from "../../../../db/config";

// Local subcomponent imports
import AttachmentZone from "./TextEditorWithAttachments/AttachmentZone";
import MenuBar from "./TextEditorWithAttachments/MenuBar";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export interface TextEditorProps {
  content?: string;
  onUpdate?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
  wrapperClassName?: string;
  menuBarClassName?: string;
  editorContentClassName?: string;
  height?: string;
  maxLength?: number;
  minLength?: number;
  mentions?: { name: string; username: string; _id: string }[];
  autoFocus?: boolean;
  newAttachments?: File[];
  setNewAttachments?: (
    attachments: File[] | ((prev: File[]) => File[])
  ) => void;
  existingAttachments?: string[];
  setExistingAttachments?: (
    attachments: string[] | ((prev: string[]) => string[])
  ) => void;
  caseId?: string; // Optional caseId for existing cases
}

const TextEditorWithAttachments: React.FC<TextEditorProps> = ({
  content: propContent,
  onUpdate,
  editable = true,
  placeholder = "Напишете нещо...",
  wrapperClassName,
  menuBarClassName,
  editorContentClassName = "w-full text-base text-gray-900 focus:outline-none",
  height = "150px",
  maxLength,
  minLength,
  mentions,
  autoFocus = false,
  newAttachments = [],
  setNewAttachments,
  existingAttachments = [],
  setExistingAttachments,
  caseId,
}) => {
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation("caseSubmission");
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const mentionSuggestionConfig = useMemo(
    () => createMentionSuggestion(mentions),
    [mentions]
  );
  const isContentTooLong = useMemo(
    () => maxLength && charCount > maxLength,
    [charCount, maxLength]
  );
  const isContentTooShort = useMemo(
    () => minLength && charCount > 0 && charCount < minLength,
    [charCount, minLength]
  );
  const isInvalid = isContentTooLong || isContentTooShort;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      TextAlign.configure({ types: ["paragraph"], defaultAlignment: "left" }),
      Placeholder.configure({
        placeholder: ({ editor }) =>
          editor.getText().trim() === "" ? placeholder || "" : "",
      }),
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: mentionSuggestionConfig,
      }),
    ],
    content: propContent || "",
    editable,
    onUpdate: ({ editor: currentEditor }) => {
      setAttachmentError(null);
      setCharCount(currentEditor.getText().length);
      if (onUpdate) {
        onUpdate(currentEditor.isEmpty ? "" : currentEditor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none p-3 pr-4 focus:outline-none custom-tiptap-editor",
        style: `min-height: ${height}; overflow-y: auto; padding-bottom: 2rem;`,
      },
    },
  });
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !setNewAttachments) return;
    setAttachmentError(null);
    const files = Array.from(event.target.files);

    const currentFileNames = new Set([
      ...newAttachments.map((file) => file.name),
      ...existingAttachments.map((url) => url.split("/").pop() || ""),
    ]);

    const validFiles: File[] = [];
    let oversizedFileError: string | null = null;
    let duplicateFileError: string | null = null;
    let localError: string | null = null; // Used to track errors before setting state

    // 1. Filter files for duplicates and size errors
    for (const file of files) {
      if (currentFileNames.has(file.name)) {
        if (!duplicateFileError) {
          duplicateFileError = t(
            "caseSubmission.errors.file.fileAlreadyExists",
            {
              fileName: file.name,
            }
          );
        }
      } else if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
        if (!oversizedFileError) {
          oversizedFileError = t("caseSubmission.errors.file.fileTooLarge", {
            fileName: file.name,
            maxSize: MAX_UPLOAD_MB,
          });
        }
      } else {
        validFiles.push(file);
        currentFileNames.add(file.name);
      }
    }

    // Set filtering errors (will be overridden if overflow)
    if (duplicateFileError) {
      localError = duplicateFileError;
    } else if (oversizedFileError) {
      localError = oversizedFileError;
    }

    // 2. Check for overflow
    const currentCount = newAttachments.length + existingAttachments.length;
    const availableSlots = MAX_UPLOAD_FILES - currentCount;
    let filesToAdd: File[] = [];

    if (validFiles.length > availableSlots) {
      // If overflowing, slice to fit and set the "skipped" error
      filesToAdd = validFiles.slice(0, availableSlots);
      const skippedCount = validFiles.length - availableSlots;

      // This error takes priority
      localError = t("caseSubmission.errors.file.filesSkipped", {
        max: MAX_UPLOAD_FILES,
        count: skippedCount,
      });
    } else {
      // No overflow, add all valid files
      filesToAdd = validFiles;
    }

    // 3. Set the final error state (if any)
    if (localError) {
      setAttachmentError(localError);
    }

    // 4. Add the files that fit
    if (filesToAdd.length > 0) {
      setNewAttachments((prev) => [...prev, ...filesToAdd]);

      // Only show success if no errors were set
      if (localError === null) {
        toast.success(
          t("caseSubmission.filesAdded", { count: filesToAdd.length })
        );
      }
    }

    event.target.value = "";
  };

  useEffect(() => {
    if (editor && autoFocus) {
      const timer = setTimeout(() => editor.chain().focus("end").run(), 100);
      return () => clearTimeout(timer);
    }
  }, [editor, autoFocus]);

  useEffect(() => {
    setCharCount(getTextLength(propContent || ""));
  }, [propContent]);

  useEffect(() => {
    if (editor && propContent !== undefined) {
      const currentHTML = editor.getHTML();
      if (currentHTML !== propContent) {
        const isEditorEmpty = editor.getText().trim() === "";
        const isPropEmpty = !propContent || propContent === "<p></p>";
        if (isEditorEmpty && isPropEmpty) return;
        editor.commands.setContent(propContent);
      }
    }
  }, [propContent, editor]);

  const finalWrapperClassName = `relative w-full border rounded-md shadow-sm overflow-hidden bg-white focus-within:ring-1 transition-colors duration-150 ${
    isInvalid
      ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500"
      : "border-gray-300 focus-within:border-indigo-500 focus-within:ring-indigo-500"
  } ${wrapperClassName || ""}`;

  return (
    <>
      <div className={finalWrapperClassName.trim()}>
        <MenuBar
          editor={editor}
          className={menuBarClassName}
          onAttachClick={() => fileInputRef.current?.click()}
        />

        <div className="relative">
          <EditorContent editor={editor} className={editorContentClassName} />
          {maxLength && (
            <div
              className={`absolute bottom-2 right-4 text-xs ${
                isInvalid ? "text-red-500 font-semibold" : "text-gray-500"
              } bg-white/80 backdrop-blur-sm px-1 rounded shadow-md`}
            >
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        {attachmentError && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border-t border-gray-200">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>{attachmentError}</span>
          </div>
        )}
        <AttachmentZone
          newAttachments={newAttachments}
          existingAttachments={existingAttachments}
          onRemoveNew={(index) =>
            setNewAttachments?.((prev) => prev.filter((_, i) => i !== index))
          }
          onRemoveExisting={(url) =>
            setExistingAttachments?.((prev) => prev.filter((u) => u !== url))
          }
          caseId={caseId}
        />
      </div>
    </>
  );
};

export default TextEditorWithAttachments;
