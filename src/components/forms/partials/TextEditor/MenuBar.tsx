// src/components/forms/partials/TextEditor/MenuBar.tsx
import React from "react";
import { Editor } from "@tiptap/react";
import {
  ListBulletIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  NumberedListIcon,
  PaperClipIcon,
  AtSymbolIcon,
} from "@heroicons/react/20/solid";
import { useTranslation } from "react-i18next";
import TextEditorHelper from "./TextEditorHelper";

interface MenuBarProps {
  editor: Editor | null;
  onAttachClick: () => void;
  disabled: boolean;
  isMaxFilesReached: boolean;
  type: "case" | "answer" | "comment";
}

const MenuBar: React.FC<MenuBarProps> = ({
  editor,
  onAttachClick,
  disabled,
  isMaxFilesReached,
  type,
}) => {
  const { t } = useTranslation("menu");
  if (!editor) return null;

  const allItems = [
    {
      id: "bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: "bold",
      label: "B",
      title: t("rte.bold"),
    },
    {
      id: "italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: "italic",
      label: "I",
      title: t("rte.italic"),
    },
    {
      id: "underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: "underline",
      label: "U",
      title: t("rte.underline"),
      onlyCase: true,
    },
    {
      id: "bulletList",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: "bulletList",
      icon: ListBulletIcon,
      title: t("rte.bulletList"),
      onlyCase: true,
    },
    {
      id: "orderedList",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: "orderedList",
      icon: NumberedListIcon,
      title: t("rte.orderedList"),
      onlyCase: true,
    },
    {
      id: "alignLeft",
      action: () => editor.chain().focus().setTextAlign("left").run(),
      isActive: { textAlign: "left" },
      icon: Bars3BottomLeftIcon,
      title: t("rte.alignLeft"),
    },
    {
      id: "alignCenter",
      action: () => editor.chain().focus().setTextAlign("center").run(),
      isActive: { textAlign: "center" },
      icon: Bars3Icon,
      title: t("rte.alignCenter"),
    },
  ];

  const filteredItems = allItems.filter(
    (item) => type === "case" || !item.onlyCase
  );

  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
      <div className="flex flex-wrap gap-1">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={item.action}
            title={item.title}
            className={`p-2 rounded-md transition-all ${
              editor.isActive(item.isActive)
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {item.icon ? (
              <item.icon className="w-5 h-5" />
            ) : (
              <span className="w-5 h-5 flex items-center justify-center font-bold">
                {item.label}
              </span>
            )}
          </button>
        ))}
        <div className="w-[1px] h-6 bg-gray-300 mx-1 self-center" />
        {type !== "case" && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().insertContent(" @").run()}
            title={t("rte.mention")}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
          >
            <AtSymbolIcon className="w-5 h-5" />
          </button>
        )}
        <button
          type="button"
          disabled={disabled || isMaxFilesReached}
          onClick={onAttachClick}
          className={`p-2 rounded-md ${
            disabled || isMaxFilesReached
              ? "text-gray-300"
              : "text-gray-500 hover:bg-gray-200 cursor-pointer"
          }`}
        >
          <PaperClipIcon className="w-5 h-5" />
        </button>
      </div>
      <TextEditorHelper type={type} />
    </div>
  );
};
export default MenuBar;
