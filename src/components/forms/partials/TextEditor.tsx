// src/components/TextEditor.tsx
import React, { useEffect, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
// import Highlight from "@tiptap/extension-highlight"; // If you added it

// --- 1. Import Heroicons ---
import {
  ListBulletIcon,
  NumberedListIcon, // Using this for Ordered List as a common alternative
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon, // For Align Center (can also be Bars2Icon)
  // For Bold, Italic, Underline, Strikethrough, we'll use stylized text
  // as Heroicons doesn't have direct "B", "I", "U", "S" typography icons.
} from "@heroicons/react/20/solid";

// --- Component Props --- (no changes)
export interface TextEditorProps {
  content?: string;
  onUpdate?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
  wrapperClassName?: string;
  menuBarClassName?: string;
  editorContentClassName?: string;
  minHeight?: string;
  maxHeight?: string;
}

// --- Menu Bar Button Configuration --- (no changes)
interface MenuButtonConfig {
  id: string;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  canExecute?: (editor: Editor) => boolean;
  label?: string | React.ReactNode;
  title: string;
}

// --- MenuBar Component ---
interface MenuBarProps {
  editor: Editor | null;
  className?: string;
  renderKey?: number;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, className, renderKey }) => {
  if (!editor) return null;

  // console.log(
  //   `MenuBar rendering (key: ${renderKey}). Editor selection anchor:`,
  //   editor.state.selection.anchor
  // );

  // --- 2. Update menuItem labels with icons or stylized text ---
  // We'll aim for a visual size similar to 20x20px icons (w-5 h-5).
  // text-lg (1.125rem = 18px) or text-xl (1.25rem = 20px) can work for text.
  // leading-tight or leading-none helps vertically align text in buttons.
  const iconSizeClass = "w-5 h-5"; // For Heroicons (20x20px)
  const textLabelBaseClass = "text-lg leading-tight"; // For B, I, U, S, 1.

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
      canExecute: (e) => e.isEditable, // Changed from e.can().toggleBulletList()
      label: <ListBulletIcon className={iconSizeClass} />,
      title: "Bullet List",
    },
    {
      id: "orderedList",
      action: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive("orderedList"),
      canExecute: (e) => e.isEditable, // Changed from e.can().toggleOrderedList()
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
      label: <Bars3Icon className={iconSizeClass} />, // Often used for center or generic menu
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
            // --- 3. Adjust padding if needed, current should be okay ---
            // The `px-2.5 py-1.5` gives space around the icon/text.
            // The `text-sm` on the button itself sets a base, but the icon/span can override its own size.
            // Ensure buttons are vertically centered if text and icons have different heights.
            // Adding `flex items-center justify-center` to the button can help if alignment is off.
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
            style={{ minWidth: "36px", minHeight: "36px" }} // Ensure consistent button size
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
const MemoizedMenuBar = React.memo(MenuBar);

// --- TextEditor Component ---
const TextEditor: React.FC<TextEditorProps> = ({
  content: propContent,
  onUpdate,
  editable = true,
  placeholder = "Напишете нещо...",
  wrapperClassName = "w-full border border-gray-300 rounded-md shadow-sm overflow-hidden bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500",
  menuBarClassName,
  editorContentClassName = "w-full text-base text-gray-900 focus:outline-none",
  minHeight: propMinHeight = "150px",
  maxHeight: propMaxHeight,
}) => {
  const [renderKey, setRenderKey] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      TextAlign.configure({ types: ["paragraph"], defaultAlignment: "left" }),
      Placeholder.configure({ placeholder }),
      // Highlight, // If you added it
    ],
    content: propContent || "",
    editable,
    onTransaction: () => {
      setRenderKey((key) => key + 1);
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (onUpdate) {
        onUpdate(currentEditor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none p-3 focus:outline-none custom-tiptap-editor",
        style: `min-height: ${propMinHeight}; ${
          propMaxHeight ? `max-height: ${propMaxHeight}; overflow-y: auto;` : ""
        }`,
      },
    },
  });

  useEffect(() => {
    if (editor && propContent !== undefined) {
      const currentHTML = editor.getHTML();
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
