// src/components/forms/partials/TextEditor/TextEditorHelper.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  InformationCircleIcon,
  ListBulletIcon,
  NumberedListIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  AtSymbolIcon,
  PaperClipIcon,
} from "@heroicons/react/20/solid";
import { InformationCircleIcon as InfoOutline } from "@heroicons/react/24/outline";
import * as Popover from "@radix-ui/react-popover"; // Заменяме Tooltip с Popover

const TextEditorHelper: React.FC<{
  type: "case" | "answer" | "comment";
  hideAttach?: boolean;
}> = ({ type, hideAttach = false }) => {
  const { t } = useTranslation(["menu"]);
  const configs: Record<string, { icon: React.ReactNode; onlyCase?: boolean }> =
    {
      bold: {
        icon: <span className="font-bold text-xs w-4 text-center">B</span>,
      },
      italic: {
        icon: <span className="italic text-xs w-4 text-center">I</span>,
      },
      underline: {
        icon: <span className="underline text-xs w-4 text-center">U</span>,
        onlyCase: true,
      },
      bulletList: {
        icon: <ListBulletIcon className="w-4 h-4" />,
        onlyCase: true,
      },
      orderedList: {
        icon: <NumberedListIcon className="w-4 h-4" />,
        onlyCase: true,
      },
      alignLeft: { icon: <Bars3BottomLeftIcon className="w-4 h-4" /> },
      alignCenter: { icon: <Bars3Icon className="w-4 h-4" /> },
      mention: { icon: <AtSymbolIcon className="w-4 h-4" /> },
      attachment: { icon: <PaperClipIcon className="w-4 h-4" /> },
    };

  const visible = Object.keys(configs).filter((key) => {
    if (key === "attachment" && hideAttach) return false;
    if (type === "case" && key === "mention") return false;
    if (type === "case") return true;
    return !configs[key].onlyCase;
  });

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none cursor-pointer"
          title={t("rte.help")}
        >
          <InfoOutline className="w-6 h-6" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={5}
          className="z-[100] bg-white p-4 rounded-xl shadow-2xl border border-gray-200 max-w-[280px] animate-in fade-in zoom-in-95 focus:outline-none"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b pb-2 border-gray-200">
              <InformationCircleIcon className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-bold text-gray-800">{t("rte.help")}</p>
            </div>

            <ul className="space-y-2.5">
              {visible.map((key) => (
                <li
                  key={key}
                  className="flex items-center gap-3 text-[13px] text-gray-600 group"
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded text-gray-500 transition-colors">
                    {configs[key].icon}
                  </div>
                  <span className="leading-tight">{t(`rte.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default TextEditorHelper;
