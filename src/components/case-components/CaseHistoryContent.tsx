import React from "react";
import { ICaseHistory } from "../../db/interfaces";
import ShowDate from "../global/ShowDate";
import { getPriorityStyle } from "../../utils/style-helpers";
import { useTranslation } from "react-i18next";
import { diffWords } from "diff";

const getDifferences = (oldText: string, newText: string) => {
  const diff = diffWords(oldText, newText);
  const significantThreshold = Math.min(oldText.length, newText.length) * 0.5; // 50% difference threshold

  // Check if the differences are too significant
  const totalRemoved = diff
    .filter((part) => part.removed)
    .reduce((sum, part) => sum + part.value.length, 0);
  const totalAdded = diff
    .filter((part) => part.added)
    .reduce((sum, part) => sum + part.value.length, 0);

  if (
    totalRemoved > significantThreshold ||
    totalAdded > significantThreshold
  ) {
    return (
      <>
        <span className="text-btnRedHover line-through block">{oldText}</span>
        <span className="text-btnGreenHover font-bold block">{newText}</span>
      </>
    );
  }

  // Handle regular differences
  return diff.map((part, index) => {
    const className = part.added
      ? "text-green-500 font-bold" // Highlight added parts in green
      : part.removed
      ? "text-red-500 line-through" // Cross out removed parts
      : "text-gray-700"; // Unchanged parts

    return (
      <span key={index} className={className}>
        {part.value}
      </span>
    );
  });
};

const CaseHistoryContent: React.FC<{ history: ICaseHistory[] }> = ({
  history,
}) => {
  const { t } = useTranslation("history");

  return (
    <ul className="space-y-2 text-sm max-h-96 overflow-y-auto">
      {history.map((h) => (
        <li key={h._id} className="text-gray-700 border-b pb-2">
          <div>
            <span className="font-semibold">
              {<ShowDate date={h.date_change} />}
            </span>
            {" – "}
            <span className="font-medium">{h.user?.name}</span>
          </div>
          {/* Show changed fields if present */}
          <div className="ml-2">
            {h.old_content !== h.new_content &&
              h.old_content &&
              h.new_content && (
                <div>
                  {getDifferences(h.old_content, h.new_content)}
                  {/* <div>
                    <span className="text-gray-500">{t("old_content")}: </span>
                    <span className="line-through text-btnRedHover font-bold">
                      {h.old_content}
                    </span>
                  </div>
                  <div>
                    {" "}
                    <span className="text-gray-500 ">{t("new_content")}: </span>
                    <span className="text-btnGreenHover font-bold">
                      {h.new_content}
                    </span>
                  </div> */}
                </div>
              )}
            {h.old_priority !== h.new_priority &&
              h.old_priority &&
              h.new_priority && (
                <div>
                  <span className="text-gray-500">{t("priority")}: </span>
                  <span
                    className={`line-through ${getPriorityStyle(
                      h.old_priority
                    )}`}
                  >
                    {t(`${h.old_priority}`)}
                  </span>
                  <span
                    className={`ml-2 ${getPriorityStyle(
                      h.new_priority
                    )} font-bold`}
                  >
                    {t(`${h.new_priority}`)}
                  </span>
                </div>
              )}
            {h.old_type !== h.new_type && (
              <div>
                <span className="text-gray-500">{t("type")}: </span>
                <span className="line-through">{t(`${h.old_type}`)}</span>
                <span className="ml-2 font-bold">{t(`${h.new_type}`)}</span>
              </div>
            )}
            {/* Categories diff */}
            {(h.old_categories?.length > 0 || h.new_categories?.length > 0) && (
              <div>
                <span className="text-gray-500">{t("categories")}: </span>
                <span className="line-through text-btnRedHover">
                  {h.old_categories?.map((cat) => cat.name).join(", ")}
                </span>
                <span className="ml-2 text-btnGreenHover font-bold">
                  {h.new_categories?.map((cat) => cat.name).join(", ")}
                </span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CaseHistoryContent;
