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
  height = "auto", // Default height if none is provided
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
        // The editor's own element should fill its container but not scroll itself
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
    <>
      {/* Added styles for a custom scrollbar to ensure it's always visible when needed */}
      {/* <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style> */}
      {/* The main container now gets the height style applied directly only if the height prop is not 'auto' */}
      <div
        className={finalWrapperClassName.trim()}
        style={height !== "auto" ? { height } : {}}
      >
        {editor && (
          // The menu bar is a flex item that does not shrink, keeping it at the top.
          <div className="flex-shrink-0 flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md z-10">
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
        {/* This div is now the scrollable container */}
        <div className="relative flex-grow overflow-y-auto custom-scrollbar">
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
    </>
  );
};

export default SimpleTextEditor;
