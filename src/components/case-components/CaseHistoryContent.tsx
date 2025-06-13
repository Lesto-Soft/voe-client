import React from "react";
import { ICaseHistory } from "../../db/interfaces";
import ShowDate from "../global/ShowDate";
import UserLink from "../global/UserLink";
import { getPriorityStyle } from "../../utils/style-helpers";
import { useTranslation } from "react-i18next";
import {
  getDifferences,
  getSimplifiedDifferences,
} from "../../utils/contentDifferences";

const CaseHistoryContent: React.FC<{
  history: ICaseHistory[];
  compact?: boolean; // New prop for compact display
}> = ({ history, compact = false }) => {
  const { t } = useTranslation("history");

  return (
    <ul className="space-y-3 text-sm overflow-y-auto">
      {history.map((h) => (
        <li
          key={h._id}
          className="text-gray-700 border-b border-gray-100 pb-3 last:border-b-0"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                <ShowDate date={h.date_change} />
              </span>
              <UserLink user={h.user} type="case" />
            </div>
          </div>

          {/* Show changed fields if present */}
          <div className="ml-0 space-y-2">
            {h.old_content !== h.new_content &&
              h.old_content &&
              h.new_content && (
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
                  <span className="text-gray-500 font-medium">
                    {t("priority")}:
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs line-through ${getPriorityStyle(
                      h.old_priority
                    )}`}
                  >
                    {t(`${h.old_priority}`)}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${getPriorityStyle(
                      h.new_priority
                    )}`}
                  >
                    {t(`${h.new_priority}`)}
                  </span>
                </div>
              )}

            {h.old_type !== h.new_type && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 font-medium">{t("type")}:</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs line-through">
                  {t(`${h.old_type}`)}
                </span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                  {t(`${h.new_type}`)}
                </span>
              </div>
            )}

            {/* Categories diff */}
            {(h.old_categories?.length > 0 || h.new_categories?.length > 0) && (
              <div className="space-y-1">
                <span className="text-gray-500 font-medium text-sm">
                  {t("categories")}:
                </span>
                {h.old_categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-red-600">Премахнати:</span>
                    {h.old_categories.map((cat) => (
                      <span
                        key={cat._id}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs line-through"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
                {h.new_categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-green-600">Добавени:</span>
                    {h.new_categories.map((cat) => (
                      <span
                        key={cat._id}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CaseHistoryContent;
