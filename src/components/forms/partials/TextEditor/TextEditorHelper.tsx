// src/components/forms/partials/TextEditor/TextEditorHelper.tsx
import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { useTranslation } from "react-i18next";
import {
  QuestionMarkCircleIcon,
  XMarkIcon,
  ListBulletIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import { NumberedListIcon } from "@heroicons/react/20/solid";

const TextEditorHelper: React.FC = () => {
  const { t } = useTranslation(["menu", "answer"]);

  const features = [
    {
      id: "bold",
      icon: <strong className="font-mono">B</strong>,
      description: t("menu:rte.bold"),
    },
    {
      id: "italic",
      icon: <em className="font-mono">I</em>,
      description: t("menu:rte.italic"),
    },
    {
      id: "underline",
      icon: <u className="font-mono">U</u>,
      description: t("menu:rte.underline"),
    },
    {
      id: "strike",
      icon: <s className="font-mono">S</s>,
      description: t("menu:rte.strikethrough"),
    },
    {
      id: "bulletList",
      icon: <ListBulletIcon className="h-5 w-5" />,
      description: t("menu:rte.bulletList"),
    },
    {
      id: "orderedList",
      icon: <NumberedListIcon className="h-5 w-5" />,
      description: t("menu:rte.orderedList"),
    },
    {
      id: "alignLeft",
      icon: <Bars3BottomLeftIcon className="h-5 w-5" />,
      description: t("menu:rte.alignLeft"),
    },
    {
      id: "alignCenter",
      icon: <Bars3Icon className="h-5 w-5" />,
      description: t("menu:rte.alignCenter"),
    },
    {
      id: "alignRight",
      icon: <Bars3BottomRightIcon className="h-5 w-5" />,
      description: t("menu:rte.alignRight"),
    },
  ];

  return (
    <Popover.Root modal={true}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="cursor-pointer p-1 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
          title={t("menu:rte.help") || "Help"}
        >
          <QuestionMarkCircleIcon className="w-5 h-5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={5}
          align="end"
          className="w-[400px] bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 data-[state=open]:animate-contentShow"
        >
          <h3 className="text-md font-medium text-gray-900">
            {t("answer:rte.title")}
          </h3>
          <p className="mt-1 text-sm text-gray-600 mb-4">
            {t("answer:rte.description")}
          </p>
          <ul className="space-y-2 text-sm max-h-74 overflow-y-auto pr-2">
            {features.map((feature) => (
              <li key={feature.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-6 flex items-center justify-center rounded bg-gray-200">
                  {feature.icon}
                </div>
                <span>- {feature.description}</span>
              </li>
            ))}
          </ul>
          <Popover.Close
            className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:bg-gray-100 cursor-pointer"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </Popover.Close>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default TextEditorHelper;
