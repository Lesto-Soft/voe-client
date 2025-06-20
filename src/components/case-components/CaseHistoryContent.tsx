import React, { useState } from "react";
import { ICaseHistory, ICategory } from "../../db/interfaces";
import ShowDate from "../global/ShowDate";
import UserLink from "../global/UserLink";
import { getPriorityStyle, getTypeBadgeStyle } from "../../utils/style-helpers";
import { useTranslation } from "react-i18next";
import {
  getDifferences,
  getSimplifiedDifferences,
} from "../../utils/contentDifferences";
import {
  FlagIcon,
  CodeBracketIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import CategoryLink from "../global/CategoryLink";
import { isHtmlContent, stripHtmlTags } from "../../utils/contentRenderer";

type ViewMode = "content" | "formatting";

const CaseHistoryContent: React.FC<{
  history: ICaseHistory[];
  compact?: boolean;
}> = ({ history, compact = false }) => {
  const { t } = useTranslation("history");
  const [viewModes, setViewModes] = useState<{ [key: string]: ViewMode }>({});

  const handleToggle = (historyId: string, mode: ViewMode) => {
    setViewModes((prev) => ({ ...prev, [historyId]: mode }));
  };

  const CategoryLinkWrapper = (props: { category: ICategory }) => {
    const categoryAsProps = { ...props.category };
    // @ts-ignore
    return CategoryLink(categoryAsProps);
  };

  return (
    <ul className="space-y-3 text-sm overflow-y-auto">
      {history.map((h) => {
        const oldCategoryIds = new Set(h.old_categories?.map((cat) => cat._id));
        const newCategoryIds = new Set(h.new_categories?.map((cat) => cat._id));
        const removedCategories =
          h.old_categories?.filter((cat) => !newCategoryIds.has(cat._id)) || [];
        const addedCategories =
          h.new_categories?.filter((cat) => !oldCategoryIds.has(cat._id)) || [];

        const oldContent = h.old_content || "";
        const newContent = h.new_content || "";
        const hasContentChange =
          stripHtmlTags(oldContent) !== stripHtmlTags(newContent);
        const hasFormattingChange =
          isHtmlContent(oldContent) || isHtmlContent(newContent);

        // --- NEW: Smart default view logic ---
        const isFormattingOnlyChange = !hasContentChange && hasFormattingChange;
        const defaultView = isFormattingOnlyChange ? "formatting" : "content";
        const currentView = viewModes[h._id] || defaultView;

        return (
          <li
            key={h._id}
            className="text-gray-700 border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-6">
                <UserLink user={h.user} />
                <span className="font-semibold text-gray-900">
                  <ShowDate date={h.date_change} />
                </span>
              </div>
            </div>

            <div className="ml-0 space-y-2">
              {h.old_content !== h.new_content && (
                <div>
                  {/* --- NEW: Layout for label and toggle buttons --- */}
                  <div className="flex items-center gap-5 justify-left mb-2">
                    <span className="text-md text-gray-500 font-bold underline">
                      Съдържание:
                    </span>
                    {hasFormattingChange && !compact && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggle(h._id, "content")}
                          disabled={!hasContentChange}
                          title="View plain text changes"
                          className={`flex items-center px-2 py-0.5 text-xs rounded-md border transition-colors ${
                            currentView === "content"
                              ? "bg-gray-500 text-white border-gray-500 font-semibold"
                              : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                          }`}
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                          Текст
                        </button>
                        <button
                          onClick={() => handleToggle(h._id, "formatting")}
                          disabled={!hasFormattingChange}
                          title="View formatting changes"
                          className={`flex items-center px-2 py-0.5 text-xs rounded-md border transition-colors ${
                            currentView === "formatting"
                              ? "bg-gray-500 text-white border-gray-500 font-semibold"
                              : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                          }`}
                        >
                          <CodeBracketIcon className="h-4 w-4 mr-1.5" />
                          Формат
                        </button>
                      </div>
                    )}
                  </div>

                  {compact
                    ? getSimplifiedDifferences(h.old_content, h.new_content)
                    : getDifferences(h.old_content, h.new_content, currentView)}
                </div>
              )}

              {h.old_priority !== h.new_priority &&
                h.old_priority &&
                h.new_priority && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-bold underline">
                      {t("priority")}:
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs line-through ${getPriorityStyle(
                        h.old_priority
                      )}`}
                    >
                      <span className="flex items-center gap-2">
                        <FlagIcon className="h-4 w-4" />
                        {t(`${h.old_priority}`)}
                      </span>
                    </span>
                    <span className="text-gray-400">→</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${getPriorityStyle(
                        h.new_priority
                      )}`}
                    >
                      <span className="flex items-center gap-2">
                        <FlagIcon className="h-4 w-4" />
                        {t(`${h.new_priority}`)}
                      </span>
                    </span>
                  </div>
                )}

              {h.old_type !== h.new_type && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 font-bold underline">
                    {t("type", "Тип")}:
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs line-through ${getTypeBadgeStyle(
                      h.old_type || ""
                    )}`}
                  >
                    {t(`${h.old_type}`)}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${getTypeBadgeStyle(
                      h.new_type || ""
                    )}`}
                  >
                    {t(`${h.new_type}`)}
                  </span>
                </div>
              )}

              {(removedCategories.length > 0 || addedCategories.length > 0) && (
                <div className="space-y-1">
                  <div className="text-gray-500 font-bold underline text-sm mb-1">
                    {t("categories")}:
                  </div>
                  {removedCategories.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1">
                      <span className="text-xs text-gray-500">Премахнати:</span>
                      {removedCategories.map((cat) => (
                        <span
                          key={cat._id}
                          className="relative after:content-[''] after:absolute after:top-1/3 after:left-1/20 after:w-9/10 after:h-[2px] after:bg-sky-700 after:pointer-events-none"
                          title="Премахната категория"
                        >
                          <CategoryLinkWrapper category={cat} />
                        </span>
                      ))}
                    </div>
                  )}
                  {addedCategories.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1">
                      <span className="text-xs text-gray-500">Добавени:</span>
                      {addedCategories.map((cat) => (
                        <CategoryLinkWrapper key={cat._id} category={cat} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default CaseHistoryContent;
