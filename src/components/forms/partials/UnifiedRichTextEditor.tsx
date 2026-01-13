import React, { useRef, useMemo, useEffect, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useTranslation } from "react-i18next";
import {
  PaperAirplaneIcon,
  ArrowPathIcon,
  ListBulletIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  NumberedListIcon,
  PaperClipIcon,
  AtSymbolIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";

import { useFileHandler } from "../../../hooks/useFileHandler";
import { usePastedAttachments } from "../hooks/usePastedAttachments";
import { createMentionSuggestion } from "./TextEditor/MentionSuggestion";
import { CustomMention } from "./TextEditor/CustomMention";
import AttachmentZone from "./TextEditor/TextEditorWithAttachments/AttachmentZone";
import TextEditorHelper from "./TextEditor/TextEditorHelper";
import { getTextLength } from "../../../utils/contentRenderer";
import {
  UPLOAD_MAX_SIZE_BYTES,
  UPLOAD_MAX_SIZE_MB,
} from "../../../utils/GLOBAL_PARAMETERS";

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
}

const MenuBar: React.FC<{
  editor: Editor | null;
  onAttachClick: () => void;
  disabled: boolean;
}> = ({ editor, onAttachClick, disabled }) => {
  if (!editor) return null;
  const iconSize = "w-5 h-5";
  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2.5 rounded-md transition-all ${
            editor.isActive("bold")
              ? "bg-white shadow-sm text-blue-600 ring-1 ring-gray-200"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          <span className="w-5 h-5 flex items-center justify-center font-bold">
            B
          </span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2.5 rounded-md transition-all ${
            editor.isActive("italic")
              ? "bg-white shadow-sm text-blue-600 ring-1 ring-gray-200"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          <span className="w-5 h-5 flex items-center justify-center italic font-bold">
            I
          </span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2.5 rounded-md transition-all ${
            editor.isActive("bulletList")
              ? "bg-white shadow-sm text-blue-600 ring-1 ring-gray-200"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          <ListBulletIcon className={iconSize} />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2.5 rounded-md transition-all ${
            editor.isActive("orderedList")
              ? "bg-white shadow-sm text-blue-600 ring-1 ring-gray-200"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          <NumberedListIcon className={iconSize} />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2.5 rounded-md transition-all ${
            editor.isActive({ textAlign: "left" })
              ? "bg-white shadow-sm text-blue-600 ring-1 ring-gray-200"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Bars3BottomLeftIcon className={iconSize} />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const { from } = editor.state.selection;
            editor.chain().focus().insertContentAt(from, " @").run();
          }}
          className="p-2.5 rounded-md text-blue-600 hover:bg-blue-50"
          title="Mention (@)"
        >
          <AtSymbolIcon className={iconSize} />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onAttachClick}
          className="p-2.5 rounded-md text-gray-500 hover:bg-gray-200"
        >
          <PaperClipIcon className={iconSize} />
        </button>
      </div>
      <TextEditorHelper />
    </div>
  );
};

const UnifiedEditor: React.FC<UnifiedEditorProps> = ({
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
}) => {
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
      CustomMention.configure({
        suggestion: useMemo(
          () => createMentionSuggestion(mentions),
          [mentions]
        ),
      }),
    ],
    content,
    onUpdate: ({ editor }) =>
      onContentChange(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "focus:outline-none prose prose-sm max-w-none p-4 min-h-[140px] max-h-[450px] overflow-y-auto custom-scrollbar-xs",
      },
    },
  });

  const handleFiles = async (files: File[]) => {
    setFileError(null);
    if (files.length === 0) return;

    const duplicates: string[] = [];
    const validSelection: File[] = [];

    // 1. Стриктна проверка за дубликати
    files.forEach((file) => {
      const isLocalDuplicate = attachments.some(
        (a) => a.name === file.name && a.size === file.size
      );
      const isServerDuplicate = existingAttachments.some((url) =>
        url.toLowerCase().includes(file.name.toLowerCase())
      );

      if (isLocalDuplicate || isServerDuplicate) {
        duplicates.push(file.name);
      } else {
        validSelection.push(file);
      }
    });

    // Показваме грешка за всички намерени дубликати
    if (duplicates.length > 0) {
      const msg =
        duplicates.length === 1
          ? t("caseSubmission:caseSubmission.errors.file.fileAlreadyExists", {
              fileName: duplicates[0],
            })
          : t("caseSubmission:caseSubmission.errors.file.duplicatesSkipped", {
              fileList: duplicates.join(", "),
            });

      setFileError(msg);
    }

    // Ако няма нищо ново за добавяне, изчистваме инпута и спираме
    if (validSelection.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Проверка за лимит (макс 5)
    const currentTotal = attachments.length + existingAttachments.length;
    const availableSlots = Math.max(0, MAX_FILES - currentTotal);

    let toProcess = validSelection;
    if (validSelection.length > availableSlots) {
      toProcess = validSelection.slice(0, availableSlots);
      const skipped = validSelection.length - availableSlots;
      setFileError(
        t("caseSubmission:caseSubmission.errors.file.maxCountReached", {
          max: MAX_FILES,
          count: skipped,
        })
      );
    }

    // 3. Компресия и финална проверка
    if (toProcess.length > 0) {
      const processed = await processFiles(toProcess);
      const finalFiles: File[] = [];

      processed.forEach((f) => {
        if (f.size > HARD_LIMIT_BYTES) {
          setFileError(
            t("caseSubmission:caseSubmission.errors.file.fileTooLarge", {
              fileName: f.name,
              maxSize: 10,
            })
          );
        } else {
          finalFiles.push(f);
        }
      });

      setAttachments((prev) => [...prev, ...finalFiles]);
    }

    // Нулираме инпута, за да може да се избере същия файл отново (и да тригне грешка)
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
    ((k: string) => k) as any
  );

  const charCount = getTextLength(content);
  const isInvalid =
    charCount > 0 && (charCount < minLength || charCount > maxLength);
  const showAttachmentSection =
    attachments.length > 0 ||
    existingAttachments.length > 0 ||
    isCompressing ||
    !!fileError;

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
        {showAttachmentSection && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-2 min-h-[50px]">
            {isCompressing && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2 text-blue-600 bg-blue-50 rounded-lg text-sm font-bold animate-pulse border border-blue-100">
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Файловете се обработват...</span>
              </div>
            )}
            {fileError && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2 text-red-600 bg-red-50 rounded-lg text-xs font-bold border border-red-100 animate-in slide-in-from-top-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{fileError}</span>
              </div>
            )}
            <AttachmentZone
              newAttachments={attachments}
              existingAttachments={existingAttachments}
              onRemoveNew={(idx) => {
                setFileError(null);
                setAttachments((prev) => prev.filter((_, i) => i !== idx));
              }}
              onRemoveExisting={(url) =>
                setExistingAttachments?.((prev) =>
                  prev.filter((u) => u !== url)
                )
              }
            />
          </div>
        )}
      </div>
      {!hideSideButtons && (
        <div className="flex flex-row md:flex-col gap-2 min-w-[70px]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={
              isCompressing ||
              isSending ||
              attachments.length + existingAttachments.length >= MAX_FILES
            }
            className="flex-1 md:flex-none h-14 w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-all shadow-sm"
          >
            <PaperClipIcon className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => onSend?.()}
            disabled={
              isSending ||
              isCompressing ||
              isInvalid ||
              (charCount < minLength && charCount > 0)
            }
            className="flex-grow md:h-full w-full flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md group"
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
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        accept="image/*,application/pdf"
      />
    </div>
  );
};

export default UnifiedEditor;
