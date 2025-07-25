import React, { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { getTextLength } from "../../../utils/contentRenderer";

interface SimpleTextEditorProps {
  content?: string;
  onUpdate?: (html: string) => void;
  placeholder?: string;
  height?: string;
  wrapperClassName?: string;
  maxLength?: number;
  minLength?: number;
}

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  content,
  onUpdate,
  placeholder = "Напишете решение...",
  wrapperClassName,
  maxLength,
  minLength,
}) => {
  const [charCount, setCharCount] = useState(0);

  const isContentTooLong = useMemo(
    () => maxLength && charCount > maxLength,
    [charCount, maxLength]
  );

  const isContentTooShort = useMemo(
    // Content is too short if minLength is defined, there's some text, but it's less than the minimum.
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
      Underline,
      Placeholder.configure({
        placeholder: ({ editor }) => {
          if (editor.getText().trim() === "") {
            return placeholder || "";
          }
          return "";
        },
      }),
    ],
    content: content || "",
    onUpdate: ({ editor: currentEditor }) => {
      const characterCount = currentEditor.getText().length;
      setCharCount(characterCount);

      if (onUpdate) {
        const textContent = currentEditor.getText().trim();
        const output = textContent === "" ? "" : currentEditor.getHTML();
        onUpdate(output);
      }
    },
    editorProps: {
      attributes: {
        // Add `break-words` to force long text to wrap
        class:
          "prose prose-sm max-w-none p-3 pr-4 focus:outline-none custom-simple-editor",
        style: `overflow-y: auto; padding-bottom: 2rem;`,
      },
    },
  });

  // This effect syncs the character count when the initial content is loaded
  useEffect(() => {
    setCharCount(getTextLength(content || ""));
  }, [content]);

  // This effect syncs external content changes to the editor
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentHTML = editor.getHTML();
      const isEditorEmpty = editor.getText().trim() === "";
      const isPropEmpty = !content || content === "<p></p>";

      if (isEditorEmpty && isPropEmpty) return;

      if (currentHTML !== content) {
        editor.commands.setContent(content, false);
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
    <div className={finalWrapperClassName.trim()}>
      {editor && (
        <div className="flex-shrink-0 flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive("bold")
                ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            }`}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive("italic")
                ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            }`}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive("underline")
                ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            }`}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
        </div>
      )}
      <div className="relative flex-grow">
        <EditorContent editor={editor} className="h-full" />
        {maxLength && (
          <div
            className={`absolute bottom-2 right-4 text-xs ${
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
