import React from "react";
import { ICaseHistory, ICategory } from "../../db/interfaces";
import ShowDate from "../global/ShowDate";
import UserLink from "../global/UserLink";
import { getPriorityStyle, getTypeBadgeStyle } from "../../utils/style-helpers";
import { useTranslation } from "react-i18next";
import {
  getDifferences,
  getSimplifiedDifferences,
} from "../../utils/contentDifferences";
import { FlagIcon } from "@heroicons/react/24/solid";
import CategoryLink from "../global/CategoryLink";

const CaseHistoryContent: React.FC<{
  history: ICaseHistory[];
  compact?: boolean;
}> = ({ history, compact = false }) => {
  const { t } = useTranslation("history");

  // This is a workaround to handle the non-standard prop definition in your CategoryLink component.
  const CategoryLinkWrapper = (props: { category: ICategory }) => {
    const categoryAsProps = { ...props.category };
    // @ts-ignore
    return CategoryLink(categoryAsProps);
  };

  return (
    <ul className="space-y-3 text-sm overflow-y-auto">
      {history.map((h) => {
        // --- START: Calculate the actual added and removed categories ---
        const oldCategoryIds = new Set(h.old_categories?.map((cat) => cat._id));
        const newCategoryIds = new Set(h.new_categories?.map((cat) => cat._id));

        const removedCategories =
          h.old_categories?.filter((cat) => !newCategoryIds.has(cat._id)) || [];
        const addedCategories =
          h.new_categories?.filter((cat) => !oldCategoryIds.has(cat._id)) || [];
        // --- END: Calculation ---

        return (
          <li
            key={h._id}
            className="text-gray-700 border-b-5 border-gray-200 pb-3 last:border-b-0"
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
                  {compact
                    ? getSimplifiedDifferences(h.old_content, h.new_content)
                    : getDifferences(h.old_content, h.new_content)}
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

              {/* Categories diff - Now maps over the filtered arrays */}
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
