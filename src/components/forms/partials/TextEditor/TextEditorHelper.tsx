// src/components/forms/partials/TextEditor/TextEditorHelper.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  InformationCircleIcon,
  ListBulletIcon,
  NumberedListIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
  AtSymbolIcon,
} from "@heroicons/react/20/solid";
import { InformationCircleIcon as InfoOutline } from "@heroicons/react/24/outline";
import * as Tooltip from "@radix-ui/react-tooltip";

interface HelperProps {
  type: "case" | "answer" | "comment";
}

const TextEditorHelper: React.FC<HelperProps> = ({ type }) => {
  const { t } = useTranslation(["menu"]);
  const iconSize = "w-4 h-4";

  // Пълен списък с конфигурации
  const featureConfigs: Record<
    string,
    { icon: React.ReactNode; onlyCase?: boolean }
  > = {
    bold: {
      icon: <span className="font-bold text-xs w-4 text-center">B</span>,
    },
    italic: { icon: <span className="italic text-xs w-4 text-center">I</span> },
    underline: {
      icon: <span className="underline text-xs w-4 text-center">U</span>,
      onlyCase: true,
    },
    strikethrough: {
      icon: <span className="line-through text-xs w-4 text-center">S</span>,
      onlyCase: true,
    },
    bulletList: {
      icon: <ListBulletIcon className={iconSize} />,
      onlyCase: true,
    },
    orderedList: {
      icon: <NumberedListIcon className={iconSize} />,
      onlyCase: true,
    },
    alignLeft: { icon: <Bars3BottomLeftIcon className={iconSize} /> },
    alignCenter: { icon: <Bars3Icon className={iconSize} /> },
    alignRight: {
      icon: <Bars3BottomRightIcon className={iconSize} />,
      onlyCase: true,
    },
    mention: { icon: <AtSymbolIcon className={iconSize} /> },
  };

  // Филтрираме ключовете според типа
  const visibleFeatures = Object.keys(featureConfigs).filter((key) => {
    if (type === "case") return true;
    return !featureConfigs[key].onlyCase;
  });

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-blue-500 cursor-help transition-colors focus:outline-none"
          >
            <InfoOutline className="w-6 h-6" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            align="end"
            sideOffset={8}
            className="z-[100] bg-white p-4 rounded-xl shadow-2xl border border-gray-200 max-w-[280px] animate-in fade-in zoom-in-95"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <InformationCircleIcon className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-bold text-gray-800">
                  {t("rte.help")}
                </p>
              </div>
              <ul className="grid grid-cols-1 gap-y-2.5">
                {visibleFeatures.map((key) => (
                  <li
                    key={key}
                    className="flex items-center gap-3 text-[13px] text-gray-600 group"
                  >
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {featureConfigs[key].icon}
                    </div>
                    <span className="leading-tight">{t(`rte.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default TextEditorHelper;
