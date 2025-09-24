import React, { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { getTextLength } from "../../../../utils/contentRenderer";
import { createMentionSuggestion } from "./MentionSuggestion";
import { CustomMention } from "./CustomMention";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import HelpModal from "./HelperModal";
import { useTranslation } from "react-i18next";
interface SimpleTextEditorProps {
  content?: string;
  onUpdate?: (html: string) => void;
  placeholder?: string;
  height?: string;
  wrapperClassName?: string;
  maxLength?: number;
  minLength?: number;
  mentions?: { name: string; username: string; _id: string }[];
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
}) => {
  const { t } = useTranslation("menu");
  const [charCount, setCharCount] = useState(0);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
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
    <>
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
                title={t("rte.bold") || "Bold (Ctrl+B)"}
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
                title={t("rte.italic") || "Italic (Ctrl+I)"}
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
                title={t("rte.underline") || "Underline (Ctrl+U)"}
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
                title={t("rte.mention") || "Mention User (@)"}
              >
                <strong className="text-blue-600">@</strong>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(true)} // 👈 3. Call the function from the parent
              className="cursor-pointer p-1 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              title={t("rte.help") || "Help"}
            >
              <QuestionMarkCircleIcon className="w-5 h-5" />
            </button>
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
      <HelpModal isOpen={isHelpModalOpen} onOpenChange={setIsHelpModalOpen} />
    </>
  );
};

export default SimpleTextEditor;
