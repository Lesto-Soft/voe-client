import React, { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { getTextLength } from "../../../../utils/contentRenderer";
import { createMentionSuggestion } from "./MentionSuggestion";
import { CustomMention } from "./CustomMention";
import HelperModal from "./HelperModal";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MAX_UPLOAD_FILES, MAX_UPLOAD_MB } from "../../../../db/config";

interface SimpleTextEditorProps {
  content?: string;
  onUpdate?: (html: string) => void;
  placeholder?: string;
  height?: string;
  wrapperClassName?: string;
  maxLength?: number;
  minLength?: number;
  mentions?: { name: string; username: string; _id: string }[];
  onPasteFiles?: (files: File[]) => void;
  attachmentCount?: number;
}

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  content,
  onUpdate,
  placeholder = "Напишете решение...",
  height = "auto",
  wrapperClassName,
  maxLength,
  minLength,
  mentions = [],
  onPasteFiles,
  attachmentCount = 0,
}) => {
  const { t } = useTranslation(["menu", "caseSubmission"]);
  const [charCount, setCharCount] = useState(0);
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
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Placeholder.configure({
        placeholder: ({ editor }) => {
          if (editor.getText().trim() === "") {
            return placeholder || "";
          }
          return "";
        },
      }),
      CustomMention.configure({
        suggestion: mentionSuggestionConfig,
      }),
    ],
    content: content || "",
    onUpdate: ({ editor: currentEditor }) => {
      const characterCount = getTextLength(currentEditor.getHTML());
      setCharCount(characterCount);

      if (onUpdate) {
        const textContent = currentEditor.getText().trim();
        const output = textContent === "" ? "" : currentEditor.getHTML();
        onUpdate(output);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none p-3 pr-4 focus:outline-none custom-simple-editor",
        style: `padding-bottom: 2rem; min-height: 100%;`, // Use min-height to ensure it fills the scrollable area
      },
      handlePaste: (_, event) => {
        if (!onPasteFiles) {
          return false;
        }
        const items = event.clipboardData?.items;
        if (!items) return false;

        const containsFiles = Array.from(items).some(
          (item) => item.kind === "file"
        );
        if (!containsFiles) {
          return false;
        }

        if (attachmentCount >= MAX_UPLOAD_FILES) {
          toast.warn(
            t("caseSubmission:caseSubmission.noMoreAttachmentsAllowed", {
              max: MAX_UPLOAD_FILES,
            })
          );
          event.preventDefault();
          return true;
        }

        const availableSlots = MAX_UPLOAD_FILES - attachmentCount;
        const pastedBlobs: Blob[] = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === "file" && item.type.startsWith("image/")) {
            const blob = item.getAsFile();
            if (blob) {
              if (blob.size > MAX_UPLOAD_MB * 1024 * 1024) {
                toast.error(
                  t("caseSubmission:errors.fileTooLarge", {
                    fileName: "Pasted image",
                    maxSize: MAX_UPLOAD_MB,
                  })
                );
                continue;
              }
              pastedBlobs.push(blob);
            }
          }
        }

        if (pastedBlobs.length > 0) {
          event.preventDefault();
          const blobsToProcess = pastedBlobs.slice(0, availableSlots);
          if (pastedBlobs.length > blobsToProcess.length) {
            toast.warn(
              t("caseSubmission:caseSubmission.noMoreAttachmentsAllowed", {
                max: MAX_UPLOAD_FILES,
                toastId: "paste-limit",
              })
            );
          }
          const filesToAdd = blobsToProcess.map((blob, index) => {
            const extension = blob.type.split("/")[1] || "png";
            const newFileName = `pasted-image-${Date.now()}-${index}.${extension}`;
            return new File([blob], newFileName, { type: blob.type });
          });
          if (filesToAdd.length > 0) {
            onPasteFiles(filesToAdd);
            toast.success(
              t("caseSubmission:caseSubmission.filesAdded", {
                count: filesToAdd.length,
              })
            );
          }
          return true; // Event handled
        }
        return false; // Not handled, let Tiptap proceed
      },
    },
  });

  useEffect(() => {
    setCharCount(getTextLength(content || ""));
  }, [content]);

  useEffect(() => {
    if (editor && content !== undefined) {
      const currentHTML = editor.getHTML();
      const isEditorEmpty = editor.getText().trim() === "";
      const isPropEmpty = !content || content === "<p></p>";

      if (isEditorEmpty && isPropEmpty) return;

      if (currentHTML !== content) {
        editor.commands.setContent(content, {});
      }
    }
  }, [content, editor]);

  const finalWrapperClassName = `
    relative w-full border rounded-md shadow-sm overflow-hidden bg-white 
    focus-within:ring-1 transition-colors duration-150
    flex flex-col
    ${
      isInvalid
        ? "border-red-500 focus-within:ring-red-500"
        : "border-gray-300 focus-within:ring-indigo-500"
    }
    ${wrapperClassName || ""}
  `;
  return (
    <div
      className={finalWrapperClassName.trim()}
      style={height !== "auto" ? { height } : {}}
    >
      {editor && (
        <div className="flex-shrink-0 flex items-center justify-between gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md z-10">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-2 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                editor.isActive("bold")
                  ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                  : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              }`}
              title={t("menu:rte.bold") || "Bold (Ctrl+B)"}
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-2 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                editor.isActive("italic")
                  ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                  : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              }`}
              title={t("menu:rte.italic") || "Italic (Ctrl+I)"}
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`px-2 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                editor.isActive("underline")
                  ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                  : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              }`}
              title={t("menu:rte.underline") || "Underline (Ctrl+U)"}
            >
              <u>U</u>
            </button>
            <button
              type="button"
              onClick={() => {
                const { from } = editor.state.selection;
                editor.chain().focus().insertContentAt(from, " @").run();
                return;
              }}
              className="cursor-pointer px-2 py-1 rounded text-sm font-medium transition-colors text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              title={t("menu:rte.mention") || "Mention User (@)"}
            >
              <strong className="text-blue-600">@</strong>
            </button>
          </div>
          {/* Replace the old help button with the new Popover structure */}
          <HelperModal />
        </div>
      )}
      {/* This div is now the scrollable container */}
      <div className="relative flex-grow overflow-y-auto custom-scrollbar-xs">
        <EditorContent editor={editor} />
        {maxLength && (
          // The counter is now sticky to the bottom of this scrollable container
          <div
            className={`sticky bottom-2 right-4 float-right text-xs ${
              isInvalid ? "text-red-600 font-semibold" : "text-gray-500"
            } bg-white px-1 rounded shadow-sm`}
          >
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleTextEditor;
