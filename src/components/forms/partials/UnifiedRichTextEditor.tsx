// src/components/forms/partials/UnifiedRichTextEditor.tsx
import React, { useRef, useMemo, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { useTranslation } from "react-i18next";
import {
  PaperAirplaneIcon,
  ArrowPathIcon,
  PaperClipIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";

import { useFileHandler } from "../../../hooks/useFileHandler";
import { usePastedAttachments } from "../hooks/usePastedAttachments";
import { createMentionSuggestion } from "./TextEditor/MentionSuggestion";
import { CustomMention } from "./TextEditor/CustomMention";
import AttachmentZone from "./TextEditor/TextEditorWithAttachments/AttachmentZone";
import MenuBar from "./TextEditor/MenuBar";

const MAX_FILES = 5;
const HARD_LIMIT_BYTES = 10 * 1024 * 1024; // 10MB

interface UnifiedEditorProps {
  content: string;
  onContentChange: (html: string) => void;
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  existingAttachments?: string[];
  setExistingAttachments?: React.Dispatch<React.SetStateAction<string[]>>;
  onSend?: () => void | Promise<void>;
  mentions?: any[];
  placeholder?: string;
  minLength: number;
  maxLength: number;
  isSending?: boolean;
  hideSideButtons?: boolean;
  onProcessingChange?: (processing: boolean) => void;
  caseId?: string;
  type: "case" | "answer" | "comment";
  editorClassName?: string;
}

const UnifiedEditor: React.FC<UnifiedEditorProps> = (props) => {
  const {
    content,
    onContentChange,
    attachments,
    setAttachments,
    existingAttachments = [],
    setExistingAttachments,
    onSend,
    mentions = [],
    placeholder,
    minLength,
    maxLength,
    isSending = false,
    hideSideButtons = false,
    onProcessingChange,
    type,
    caseId,
  } = props;

  const { t } = useTranslation(["caseSubmission"]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const { processFiles, isCompressing } = useFileHandler();

  useEffect(() => {
    onProcessingChange?.(isCompressing);
  }, [isCompressing, onProcessingChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      TextAlign.configure({ types: ["paragraph"] }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
      CustomMention.configure({
        suggestion: useMemo(
          () => createMentionSuggestion(mentions),
          [mentions]
        ),
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onContentChange(editor.isEmpty ? "" : editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `${
          props.editorClassName || "min-h-[140px] max-h-[450px]"
        } focus:outline-none prose prose-sm max-w-none p-4 overflow-y-auto custom-scrollbar-xs`,
      },
    },
  });

  const charCount = editor?.storage.characterCount.characters() || 0;
  const currentTotal = attachments.length + existingAttachments.length;
  const isMaxFilesReached = currentTotal >= MAX_FILES;

  const handleFiles = async (files: File[]) => {
    setFileError(null);
    if (files.length === 0) return;

    const duplicates: string[] = [];
    const uniqueSelection: File[] = [];

    // 1. Филтриране на дубликати
    files.forEach((file) => {
      const isLocalDuplicate = attachments.some((a) => a.name === file.name);
      const isServerDuplicate = existingAttachments.some((url) => {
        const fileName = url.split("/").pop() || "";
        return fileName.toLowerCase() === file.name.toLowerCase();
      });

      if (isLocalDuplicate || isServerDuplicate) {
        duplicates.push(file.name);
      } else {
        uniqueSelection.push(file);
      }
    });

    // 2. Изчисляване на свободно място
    const availableSlots = MAX_FILES - currentTotal;
    let filesToProcess = uniqueSelection;
    let overLimitCount = 0;

    if (uniqueSelection.length > availableSlots) {
      filesToProcess = uniqueSelection.slice(0, availableSlots);
      overLimitCount = uniqueSelection.length - availableSlots;
    }

    // 3. Обработка на грешки (съобщения)
    if (currentTotal >= MAX_FILES && files.length > 0) {
      setFileError(
        t("caseSubmission.errors.file.maxFilesExceeded", { max: MAX_FILES })
      );
    } else if (overLimitCount > 0) {
      setFileError(
        t("caseSubmission.errors.file.maxCountReached", {
          max: MAX_FILES,
          count: overLimitCount,
        })
      );
    } else if (duplicates.length > 0) {
      setFileError(
        t("caseSubmission.errors.file.duplicatesSkipped", {
          fileList: duplicates.join(", "),
        })
      );
    }

    // 4. Компресия и добавяне на валидните файлове
    if (filesToProcess.length > 0) {
      try {
        const processed = await processFiles(filesToProcess);
        const finalValid = processed.filter((f) => {
          if (f.size > HARD_LIMIT_BYTES) {
            setFileError(
              t("caseSubmission.errors.file.fileTooLarge", {
                fileName: f.name,
                maxSize: 10,
              })
            );
            return false;
          }
          return true;
        });

        if (finalValid.length > 0) {
          setAttachments((prev) => [...prev, ...finalValid]);
        }
      } catch (err) {
        setFileError(t("caseSubmission.errors.submission.fileProcessingError"));
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Интеграция с Paste логиката
  usePastedAttachments(
    true,
    attachments,
    existingAttachments,
    (val) => {
      const next = typeof val === "function" ? val(attachments) : val;
      const justNew = next.filter((f) => !attachments.includes(f));
      if (justNew.length > 0) handleFiles(justNew);
    },
    t
  );

  const isInvalid = charCount > 0 && charCount < minLength;

  return (
    <div className="flex flex-col md:flex-row gap-3 w-full animate-in fade-in duration-300">
      <div
        className={`flex-grow flex flex-col border rounded-xl bg-white overflow-hidden transition-all duration-200 ${
          isInvalid
            ? "border-red-400 ring-2 ring-red-50"
            : "border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50"
        }`}
      >
        <MenuBar
          editor={editor}
          onAttachClick={() => fileInputRef.current?.click()}
          disabled={isCompressing || isSending}
          isMaxFilesReached={isMaxFilesReached}
          type={type}
        />
        <div className="relative flex-grow">
          <EditorContent editor={editor} />
          <div
            className={`absolute bottom-2 right-4 text-[11px] font-mono font-bold ${
              isInvalid ? "text-red-600" : "text-gray-400"
            }`}
          >
            {charCount}/{maxLength}
          </div>
        </div>

        {(attachments.length > 0 ||
          existingAttachments.length > 0 ||
          isCompressing ||
          fileError) && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-2 min-h-[50px]">
            {isCompressing && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2 text-blue-600 bg-blue-50 rounded-lg text-sm font-bold animate-pulse border border-blue-100">
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Файловете се обработват...</span>
              </div>
            )}
            {fileError && (
              <div className="flex items-center justify-between px-3 py-2 mb-2 text-red-600 bg-red-50 rounded-lg text-xs font-bold border border-red-100 animate-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>{fileError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFileError(null)}
                  className="hover:opacity-70 p-1"
                >
                  ✕
                </button>
              </div>
            )}
            <AttachmentZone
              newAttachments={attachments}
              existingAttachments={existingAttachments}
              onRemoveNew={(idx) =>
                setAttachments((prev) => prev.filter((_, i) => i !== idx))
              }
              onRemoveExisting={(url) =>
                setExistingAttachments?.((prev) =>
                  prev.filter((u) => u !== url)
                )
              }
              caseId={caseId}
            />
          </div>
        )}
      </div>

      {!hideSideButtons && (
        <div className="flex flex-row md:flex-col gap-2 min-w-[70px]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing || isSending || isMaxFilesReached}
            className="flex-1 md:flex-none h-14 w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            <PaperClipIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => onSend?.()}
            disabled={
              isSending || isCompressing || isInvalid || charCount === 0
            }
            className="flex-grow md:h-full w-full flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md group cursor-pointer"
          >
            {isSending ? (
              <ArrowPathIcon className="w-7 h-7 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>
      )}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        accept="image/*,application/pdf"
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
      />
    </div>
  );
};

export default UnifiedEditor;
