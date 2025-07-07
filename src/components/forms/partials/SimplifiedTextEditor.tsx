import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

interface SimpleTextEditorProps {
  content?: string;
  onUpdate?: (html: string) => void;
  placeholder?: string;
  height?: string;
  wrapperClassName?: string;
}

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  content,
  onUpdate,
  placeholder = "Напишете отговор...",
  height = "123px",
  wrapperClassName = "w-full border border-gray-300 rounded-md shadow-sm overflow-hidden bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500",
}) => {
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
      if (onUpdate) {
        const textContent = currentEditor.getText().trim();
        const output = textContent === "" ? "" : currentEditor.getHTML();
        onUpdate(output);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none p-3 focus:outline-none custom-simple-editor",
        style: `height: ${height}; overflow-y: auto;`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined) {
      const currentHTML = editor.getHTML();
      const isEditorEmpty = editor.getText().trim() === "";
      const isPropEmpty = content === "" || content === "<p></p>";

      if (isEditorEmpty && isPropEmpty) return;

      if (currentHTML !== content) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  return (
    <div className={wrapperClassName}>
      {editor && (
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
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
      <EditorContent editor={editor} />
    </div>
  );
};

export default SimpleTextEditor;
