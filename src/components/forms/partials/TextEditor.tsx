import React, { useEffect, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ListBulletIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  NumberedListIcon,
} from "@heroicons/react/20/solid";

export interface TextEditorProps {
  content?: string;
  onUpdate?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
  wrapperClassName?: string;
  menuBarClassName?: string;
  editorContentClassName?: string;
  height?: string;
}

// MenuBar component remains the same...
interface MenuButtonConfig {
  id: string;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  canExecute?: (editor: Editor) => boolean;
  label?: string | React.ReactNode;
  title: string;
}

interface MenuBarProps {
  editor: Editor | null;
  className?: string;
  renderKey?: number;
}
const MenuBar: React.FC<MenuBarProps> = ({ editor, className, renderKey }) => {
  if (!editor) return null;

  const iconSizeClass = "w-5 h-5";
  const textLabelBaseClass = "text-lg leading-tight";

  const menuItems: MenuButtonConfig[] = [
    {
      id: "bold",
      action: (e) => e.chain().focus().toggleBold().run(),
      isActive: (e) => e.isActive("bold"),
      canExecute: (e) => e.can().toggleBold(),
      label: <span className={`font-bold ${textLabelBaseClass}`}>B</span>,
      title: "Bold (Ctrl+B)",
    },
    {
      id: "italic",
      action: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive("italic"),
      canExecute: (e) => e.can().toggleItalic(),
      label: <span className={`italic ${textLabelBaseClass}`}>I</span>,
      title: "Italic (Ctrl+I)",
    },
    {
      id: "underline",
      action: (e) => e.chain().focus().toggleUnderline().run(),
      isActive: (e) => e.isActive("underline"),
      canExecute: (e) => e.can().toggleUnderline(),
      label: <span className={`underline ${textLabelBaseClass}`}>U</span>,
      title: "Underline (Ctrl+U)",
    },
    {
      id: "strike",
      action: (e) => e.chain().focus().toggleStrike().run(),
      isActive: (e) => e.isActive("strike"),
      canExecute: (e) => e.can().toggleStrike(),
      label: <span className={`line-through ${textLabelBaseClass}`}>S</span>,
      title: "Strikethrough",
    },
    {
      id: "bulletList",
      action: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive("bulletList"),
      canExecute: (e) => e.isEditable,
      label: <ListBulletIcon className={iconSizeClass} />,
      title: "Bullet List",
    },
    {
      id: "orderedList",
      action: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive("orderedList"),
      canExecute: (e) => e.isEditable,
      label: <NumberedListIcon className={iconSizeClass} />,
      title: "Ordered List",
    },
    {
      id: "alignLeft",
      action: (e) => e.chain().focus().setTextAlign("left").run(),
      isActive: (e) => e.isActive({ textAlign: "left" }),
      canExecute: (e) => e.can().setTextAlign("left"),
      label: <Bars3BottomLeftIcon className={iconSizeClass} />,
      title: "Align Left",
    },
    {
      id: "alignCenter",
      action: (e) => e.chain().focus().setTextAlign("center").run(),
      isActive: (e) => e.isActive({ textAlign: "center" }),
      canExecute: (e) => e.can().setTextAlign("center"),
      label: <Bars3Icon className={iconSizeClass} />,
      title: "Align Center",
    },
    {
      id: "alignRight",
      action: (e) => e.chain().focus().setTextAlign("right").run(),
      isActive: (e) => e.isActive({ textAlign: "right" }),
      canExecute: (e) => e.can().setTextAlign("right"),
      label: <Bars3BottomRightIcon className={iconSizeClass} />,
      title: "Align Right",
    },
  ];

  return (
    <div
      className={
        className ||
        "flex flex-wrap items-center gap-x-1 gap-y-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md"
      }
    >
      {menuItems.map((item) => {
        const isActive =
          editor && item.isActive ? item.isActive(editor) : false;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => item.action(editor)}
            title={item.title}
            disabled={item.canExecute ? !item.canExecute(editor) : false}
            className={`px-2 py-1 flex items-center justify-center rounded
                                text-gray-700 hover:bg-gray-200
                                focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:z-10
                                disabled:opacity-40 disabled:cursor-not-allowed
                                ${
                                  isActive
                                    ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 ring-1 ring-indigo-500"
                                    : "bg-transparent"
                                }`}
            aria-pressed={isActive}
            style={{ minWidth: "36px", minHeight: "36px" }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
const MemoizedMenuBar = React.memo(MenuBar);

const TextEditor: React.FC<TextEditorProps> = ({
  content: propContent,
  onUpdate,
  editable = true,
  placeholder = "Напишете нещо...",
  wrapperClassName = "w-full border border-gray-300 rounded-md shadow-sm overflow-hidden bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500",
  menuBarClassName,
  editorContentClassName = "w-full text-base text-gray-900 focus:outline-none",
  height = "150px",
}) => {
  const [renderKey, setRenderKey] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      TextAlign.configure({ types: ["paragraph"], defaultAlignment: "left" }),
      Placeholder.configure({
        placeholder: ({ editor }) => {
          if (editor.getText().trim() === "") {
            return placeholder || "";
          }
          // FIXED: Return an empty string instead of null
          return "";
        },
      }),
    ],
    content: propContent || "",
    editable,
    onTransaction: () => {
      setRenderKey((key) => key + 1);
    },
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
          "prose prose-sm sm:prose-base max-w-none p-3 focus:outline-none custom-tiptap-editor",
        style: `height: ${height}; overflow-y: auto;`,
      },
    },
  });

  useEffect(() => {
    if (editor && propContent !== undefined) {
      const currentHTML = editor.getHTML();
      const isEditorEmpty = editor.getText().trim() === "";
      const isPropEmpty = propContent === "" || propContent === "<p></p>";

      if (isEditorEmpty && isPropEmpty) return;

      if (currentHTML !== propContent) {
        editor.commands.setContent(propContent, false);
      }
    }
  }, [propContent, editor]);

  return (
    <div className={wrapperClassName}>
      <MemoizedMenuBar
        editor={editor}
        className={menuBarClassName}
        renderKey={renderKey}
      />
      <EditorContent editor={editor} className={editorContentClassName} />
    </div>
  );
};

export default TextEditor;
