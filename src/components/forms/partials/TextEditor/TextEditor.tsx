import React, { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline"; // ФИКС: Пуснат импорт
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  ListBulletIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  NumberedListIcon,
} from "@heroicons/react/20/solid";
import { getTextLength } from "../../../../utils/contentRenderer";
import Mention from "@tiptap/extension-mention";
import { createMentionSuggestion } from "./MentionSuggestion";
import { useTranslation } from "react-i18next";
import TextEditorHelper from "./TextEditorHelper";

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
  type?: string;
}

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
  type?: string;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, className, type }) => {
  const { t } = useTranslation("menu");
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
      title: t("rte.bold") || "Bold (Ctrl+B)",
    },
    {
      id: "italic",
      action: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive("italic"),
      canExecute: (e) => e.can().toggleItalic(),
      label: <span className={`italic ${textLabelBaseClass}`}>I</span>,
      title: t("rte.italic") || "Italic (Ctrl+I)",
    },
    {
      id: "underline",
      action: (e) => e.chain().focus().toggleUnderline().run(),
      isActive: (e) => e.isActive("underline"),
      canExecute: (e) => e.can().toggleUnderline(),
      label: <span className={`underline ${textLabelBaseClass}`}>U</span>,
      title: t("rte.underline") || "Underline (Ctrl+U)",
    },
    {
      id: "strike",
      action: (e) => e.chain().focus().toggleStrike().run(),
      isActive: (e) => e.isActive("strike"),
      canExecute: (e) => e.can().toggleStrike(),
      label: <span className={`line-through ${textLabelBaseClass}`}>S</span>,
      title: t("rte.strikethrough") || "Strikethrough",
    },
    {
      id: "bulletList",
      action: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive("bulletList"),
      canExecute: (e) => e.isEditable,
      label: <ListBulletIcon className={iconSizeClass} />,
      title: t("rte.bulletList") || "Bullet List",
    },
    {
      id: "orderedList",
      action: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive("orderedList"),
      canExecute: (e) => e.isEditable,
      label: <NumberedListIcon className={iconSizeClass} />,
      title: t("rte.orderedList") || "Ordered List",
    },
    {
      id: "alignLeft",
      action: (e) => e.chain().focus().setTextAlign("left").run(),
      isActive: (e) => e.isActive({ textAlign: "left" }),
      canExecute: (e) => e.can().setTextAlign("left"),
      label: <Bars3BottomLeftIcon className={iconSizeClass} />,
      title: t("rte.alignLeft") || "Align Left",
    },
    {
      id: "alignCenter",
      action: (e) => e.chain().focus().setTextAlign("center").run(),
      isActive: (e) => e.isActive({ textAlign: "center" }),
      canExecute: (e) => e.can().setTextAlign("center"),
      label: <Bars3Icon className={iconSizeClass} />,
      title: t("rte.alignCenter") || "Align Center",
    },
    {
      id: "alignRight",
      action: (e) => e.chain().focus().setTextAlign("right").run(),
      isActive: (e) => e.isActive({ textAlign: "right" }),
      canExecute: (e) => e.can().setTextAlign("right"),
      label: <Bars3BottomRightIcon className={iconSizeClass} />,
      title: t("rte.alignRight") || "Align Right",
    },
  ];

  return (
    <div
      className={
        className ||
        "flex flex-wrap items-center justify-between gap-x-1 gap-y-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md"
      }
    >
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
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
              className={`cursor-pointer px-2 py-1 flex items-center justify-center rounded transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:z-10
                          disabled:opacity-40 disabled:cursor-not-allowed
                          ${
                            isActive
                              ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-700"
                              : "text-gray-700 bg-transparent hover:bg-gray-200"
                          }`}
              aria-pressed={isActive}
              style={{ minWidth: "36px", minHeight: "36px" }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <TextEditorHelper type={type} />
    </div>
  );
};

const MemoizedMenuBar = React.memo(MenuBar);

const TextEditor: React.FC<TextEditorProps> = ({
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
  type,
}) => {
  const [renderKey, setRenderKey] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const mentionSuggestionConfig = useMemo(
    () => createMentionSuggestion(mentions),
    [mentions]
  );

  const isInvalid = useMemo(() => {
    const tooLong = maxLength && charCount > maxLength;
    const tooShort = minLength && charCount > 0 && charCount < minLength;
    return tooLong || tooShort;
  }, [charCount, maxLength, minLength]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline, // ФИКС: Активирано разширение
      TextAlign.configure({ types: ["paragraph"], defaultAlignment: "left" }),
      Placeholder.configure({
        placeholder: ({ editor }) =>
          editor.getText().trim() === "" ? placeholder || "" : "",
      }),
      Mention.configure({
        HTMLAttributes: { class: "mention font-bold text-blue-600" },
        suggestion: mentionSuggestionConfig,
      }),
    ],
    content: propContent || "",
    editable,
    onTransaction: () => setRenderKey((key) => key + 1),
    onUpdate: ({ editor: currentEditor }) => {
      const characterCount = currentEditor.getText().length;
      setCharCount(characterCount);
      if (onUpdate) {
        onUpdate(currentEditor.isEmpty ? "" : currentEditor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none p-3 pr-4 focus:outline-none custom-tiptap-editor",
        style: `height: ${height}; overflow-y: auto; padding-bottom: 2rem;`,
      },
    },
  });

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
      if (
        currentHTML !== propContent &&
        !(
          editor.getText().trim() === "" &&
          (!propContent || propContent === "<p></p>")
        )
      ) {
        editor.commands.setContent(propContent, {});
      }
    }
  }, [propContent, editor]);

  const finalWrapperClass = `
    relative w-full border rounded-md shadow-sm overflow-hidden bg-white 
    focus-within:ring-1 transition-colors duration-150
    ${
      isInvalid
        ? "border-red-400 focus-within:ring-red-100"
        : "border-gray-300 focus-within:ring-blue-500"
    }
    ${wrapperClassName || ""}
  `.trim();

  return (
    <div className={finalWrapperClass}>
      <MemoizedMenuBar
        editor={editor}
        className={menuBarClassName}
        renderKey={renderKey}
        type={type}
      />
      <EditorContent editor={editor} className={editorContentClassName} />
      {maxLength && (
        <div
          className={`absolute bottom-2 right-4 text-xs ${
            isInvalid ? "text-red-500 font-bold" : "text-gray-400"
          } bg-white/80 px-1 rounded`}
        >
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default TextEditor;
