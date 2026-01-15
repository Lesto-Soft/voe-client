// src/components/forms/partials/TextEditor/MenuBar.tsx
import React from "react";
import { Editor } from "@tiptap/react";
import {
  ListBulletIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
  NumberedListIcon,
  PaperClipIcon,
  AtSymbolIcon,
} from "@heroicons/react/20/solid";
import TextEditorHelper from "./TextEditorHelper";
import { useTranslation } from "react-i18next";

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

  const iconSize = "w-5 h-5";

  // Дефинираме всички възможни елементи
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
    {
      id: "alignRight",
      action: () => editor.chain().focus().setTextAlign("right").run(),
      isActive: { textAlign: "right" },
      icon: Bars3BottomRightIcon,
      title: t("rte.alignRight"),
      onlyCase: true,
    },
  ];

  // Филтрираме елементите според типа
  const filteredItems = allItems.filter((item) => {
    if (type === "case") return true; // Case вижда всичко
    return !item.onlyCase; // Answer и Comment виждат само базовите
  });

  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex flex-wrap gap-1">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={item.action}
            title={item.title}
            className={`p-2 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed ${
              editor.isActive(item.isActive)
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {item.icon ? (
              <item.icon className={iconSize} />
            ) : (
              <span className="w-5 h-5 flex items-center justify-center font-bold">
                {item.label}
              </span>
            )}
          </button>
        ))}

        <div className="w-[1px] h-6 bg-gray-300 mx-1 self-center" />

        {/* Тези винаги присъстват (според вашето изискване за Mentions и Attachments) */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor.chain().focus().insertContent(" @").run()}
          title={t("rte.mention")}
          className="p-2 rounded-md text-blue-600 hover:bg-blue-100 disabled:opacity-30"
        >
          <AtSymbolIcon className={iconSize} />
        </button>

        <button
          type="button"
          disabled={disabled || isMaxFilesReached}
          onClick={onAttachClick}
          className={`p-2 rounded-md transition-colors ${
            isMaxFilesReached
              ? "text-gray-300"
              : "text-gray-500 hover:bg-gray-200 cursor-pointer"
          }`}
        >
          <PaperClipIcon className={iconSize} />
        </button>
      </div>

      <TextEditorHelper type={type} />
    </div>
  );
};

export default MenuBar;
