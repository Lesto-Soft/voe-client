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
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

import { useFileHandler } from "../../../hooks/useFileHandler";
import { usePastedAttachments } from "../hooks/usePastedAttachments";
import { createMentionSuggestion } from "./TextEditor/MentionSuggestion";
import { CustomMention } from "./TextEditor/CustomMention";
import AttachmentZone from "./TextEditor/TextEditorWithAttachments/AttachmentZone";
import MenuBar from "./TextEditor/MenuBar";

const MAX_FILES = 5;
const HARD_LIMIT_MB = 10;
const HARD_LIMIT_BYTES = HARD_LIMIT_MB * 1024 * 1024;

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
    editorClassName,
  } = props;

  const { t } = useTranslation(["caseSubmission"]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const { processFiles, isCompressing } = useFileHandler();

  const [, setSelectionUpdate] = useState(0);

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
      ...(type !== "case"
        ? [
            CustomMention.configure({
              suggestion: useMemo(
                () => createMentionSuggestion(mentions),
                [mentions]
              ),
            }),
          ]
        : []),
    ],
    content,
    onUpdate: ({ editor }) =>
      onContentChange(editor.isEmpty ? "" : editor.getHTML()),
    onSelectionUpdate: () => setSelectionUpdate((s) => s + 1),
    onTransaction: () => setSelectionUpdate((s) => s + 1),
    editorProps: {
      attributes: {
        class: "focus:outline-none prose prose-sm max-w-none p-4 min-h-[150px]",
      },
    },
  });

  const charCount = editor?.storage.characterCount.characters() || 0;
  const currentTotal = attachments.length + existingAttachments.length;
  const isMaxFilesReached = currentTotal >= MAX_FILES;
  const isInvalid = charCount > 0 && charCount < minLength;

  const handleFiles = async (files: File[]) => {
    setFileError(null);
    if (files.length === 0) return;

    // 1. Дубликати
    const duplicateFiles = files.filter(
      (file) =>
        attachments.some((a) => a.name === file.name) ||
        existingAttachments.some(
          (url) =>
            (url.split("/").pop() || "").toLowerCase() ===
            file.name.toLowerCase()
        )
    );

    if (duplicateFiles.length > 0) {
      const fileList = duplicateFiles.map((f) => f.name).join(", ");
      setFileError(
        t("caseSubmission:caseSubmission.errors.file.duplicatesSkipped", {
          fileList,
        })
      );
    }

    const uniqueSelection = files.filter((f) => !duplicateFiles.includes(f));
    if (uniqueSelection.length === 0) return;

    // 2. Размер
    const oversizedFiles = uniqueSelection.filter(
      (f) => f.size > HARD_LIMIT_BYTES
    );
    if (oversizedFiles.length > 0) {
      const fileList = oversizedFiles.map((f) => f.name).join(", ");
      setFileError(
        t("caseSubmission:caseSubmission.errors.file.oversized", {
          maxSize: HARD_LIMIT_MB,
          fileList,
        })
      );
    }

    const validSizeSelection = uniqueSelection.filter(
      (f) => f.size <= HARD_LIMIT_BYTES
    );
    if (validSizeSelection.length === 0) return;

    // 3. Лимит
    const availableSlots = MAX_FILES - currentTotal;
    if (validSizeSelection.length > availableSlots) {
      setFileError(
        t("caseSubmission:caseSubmission.errors.file.maxFilesExceeded", {
          max: MAX_FILES,
        })
      );
    }

    const filesToProcess = validSizeSelection.slice(
      0,
      Math.max(0, availableSlots)
    );

    if (filesToProcess.length > 0) {
      try {
        const processed = await processFiles(filesToProcess);
        setAttachments((prev) => [...prev, ...processed]);
      } catch (err) {
        setFileError(
          t(
            "caseSubmission:caseSubmission.errors.submission.fileProcessingError"
          )
        );
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  usePastedAttachments(
    true,
    attachments,
    existingAttachments,
    (val) => {
      const next = typeof val === "function" ? val(attachments) : val;
      handleFiles(next.filter((f) => !attachments.includes(f)));
    },
    t
  );

  return (
    <div className="flex flex-col md:flex-row gap-3 w-full h-full min-h-0 overflow-hidden">
      <div
        className={`flex-grow flex flex-col border rounded-xl bg-white overflow-hidden transition-all duration-200 min-h-0 ${
          isInvalid
            ? "border-red-400 ring-2 ring-red-50"
            : "border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50"
        }`}
      >
        <div className="flex-shrink-0">
          <MenuBar
            editor={editor}
            onAttachClick={() => fileInputRef.current?.click()}
            disabled={isCompressing || isSending}
            isMaxFilesReached={isMaxFilesReached}
            type={type}
          />
        </div>

        <div className="relative flex-grow flex flex-col min-h-0">
          <div
            className={`flex-grow overflow-y-auto custom-scrollbar-xs ${editorClassName}`}
          >
            <EditorContent editor={editor} />
          </div>
          <div
            className={`absolute bottom-2 right-4 text-xs pointer-events-none z-10 bg-white px-1 rounded shadow-sm ${
              isInvalid ? "text-red-600" : "text-gray-500"
            }`}
          >
            {charCount}/{maxLength}
          </div>
        </div>

        {(attachments.length > 0 ||
          existingAttachments.length > 0 ||
          isCompressing ||
          fileError) && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50/50 p-2 max-h-[160px] overflow-y-auto">
            {/* ЛОУДЪР ПРИ ОБРАБОТКА (ВЪЗСТАНОВЕН) */}
            {isCompressing && (
              <div className="flex items-center gap-2 px-3 py-1.5 mb-2 text-[11px] text-blue-600 font-bold bg-blue-50 border border-blue-100 rounded-lg animate-pulse">
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {t(
                    "caseSubmission:caseSubmission.processingFiles",
                    "Обработка..."
                  )}
                </span>
              </div>
            )}

            {/* ГРЕШКИ */}
            {fileError && (
              <div className="flex items-start justify-between gap-2 px-3 py-1.5 mb-2 text-[11px] bg-red-50 border border-red-100 text-red-700 rounded-lg animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-bold">{fileError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFileError(null)}
                  className="p-0.5 hover:bg-red-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
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
