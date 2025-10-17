// src/components/forms/partials/TextEditorWithAttachments/MenuBar.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import { Editor } from "@tiptap/react";
import {
  ListBulletIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  NumberedListIcon,
  PaperClipIcon,
} from "@heroicons/react/20/solid";
import TextEditorHelper from "../TextEditorHelper";

interface MenuButtonConfig {
  id: string;
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
  canExecute?: (editor: Editor) => boolean;
  label: React.ReactNode;
  title: string;
}

interface MenuBarProps {
  editor: Editor | null;
  className?: string;
  onAttachClick: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({
  editor,
  className,
  onAttachClick,
}) => {
  const { t } = useTranslation(["menu", "caseSubmission"]);
  if (!editor) return null;

  const iconSizeClass = "w-5 h-5";
  const textLabelBaseClass = "text-lg leading-tight";

  const menuItems: MenuButtonConfig[] = [
    {
      id: "bold",
      action: (e) => e.chain().focus().toggleBold().run(),
      isActive: (e) => e.isActive("bold"),
      label: <span className={`font-bold ${textLabelBaseClass}`}>B</span>,
      title: t("rte.bold") || "Bold (Ctrl+B)",
    },
    {
      id: "italic",
      action: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive("italic"),
      label: <span className={`italic ${textLabelBaseClass}`}>I</span>,
      title: t("rte.italic") || "Italic (Ctrl+I)",
    },
    {
      id: "strike",
      action: (e) => e.chain().focus().toggleStrike().run(),
      isActive: (e) => e.isActive("strike"),
      label: <span className={`line-through ${textLabelBaseClass}`}>S</span>,
      title: t("rte.strikethrough") || "Strikethrough",
    },
    {
      id: "bulletList",
      action: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive("bulletList"),
      label: <ListBulletIcon className={iconSizeClass} />,
      title: t("rte.bulletList") || "Bullet List",
    },
    {
      id: "orderedList",
      action: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive("orderedList"),
      label: <NumberedListIcon className={iconSizeClass} />,
      title: t("rte.orderedList") || "Ordered List",
    },
    {
      id: "alignLeft",
      action: (e) => e.chain().focus().setTextAlign("left").run(),
      isActive: (e) => e.isActive({ textAlign: "left" }),
      label: <Bars3BottomLeftIcon className={iconSizeClass} />,
      title: t("rte.alignLeft") || "Align Left",
    },
    {
      id: "alignCenter",
      action: (e) => e.chain().focus().setTextAlign("center").run(),
      isActive: (e) => e.isActive({ textAlign: "center" }),
      label: <Bars3Icon className={iconSizeClass} />,
      title: t("rte.alignCenter") || "Align Center",
    },
    {
      id: "alignRight",
      action: (e) => e.chain().focus().setTextAlign("right").run(),
      isActive: (e) => e.isActive({ textAlign: "right" }),
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
          const isActive = item.isActive(editor);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => item.action(editor)}
              title={item.title}
              disabled={item.canExecute ? !item.canExecute(editor) : false}
              className={`cursor-pointer px-2 py-1 flex items-center justify-center rounded text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:z-10 disabled:opacity-40 disabled:cursor-not-allowed ${
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
        <button
          type="button"
          onClick={onAttachClick}
          title={
            t("caseSubmission:caseSubmission.addAttachments") || "Add files"
          }
          className="cursor-pointer px-2 py-1 flex items-center justify-center rounded text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:z-10"
          style={{ minWidth: "36px", minHeight: "36px" }}
        >
          <PaperClipIcon className={iconSizeClass} />
        </button>
      </div>
      <TextEditorHelper />
    </div>
  );
};

export default React.memo(MenuBar);
