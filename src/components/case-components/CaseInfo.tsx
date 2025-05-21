import React from "react";
import { ICategory } from "../../db/interfaces";
import CategoryLink from "../global/CategoryLink";
import { FlagIcon } from "@heroicons/react/24/solid";
import {
  getPriorityStyle,
  getStatusStyle,
  getTypeBadgeStyle,
} from "../../utils/style-helpers";
import { labelTextClass, caseBoxClasses } from "../../ui/reusable-styles";
import { useTranslation } from "react-i18next";
import Creator from "./Creator";
import CaseRating from "./Rating";
import ShowDate from "../global/ShowDate";

interface ICaseInfoProps {
  content: string;
  case_number: number;
  caseId: string;
  type: string;
  priority: string;
  status: string;
  categories: ICategory[];
  creator: any;
  rating: any;
  date?: string;
  me: any;
  refetch: () => void;
}

const CaseInfo: React.FC<ICaseInfoProps> = ({
  content,
  case_number,
  caseId,
  type,
  priority,
  status,
  categories,
  creator,
  rating,
  date,
  me,
  refetch,
}) => {
  const { t } = useTranslation("dashboard");
  const statusStyle = getStatusStyle(status);
  const priorityStyle = getPriorityStyle(priority);
  const typeBadgeStyle = getTypeBadgeStyle(type);

  return (
    <div
      className="sticky top-0 self-start flex flex-col gap-4 w-1/5 min-w-[18rem] bg-white rounded-lg shadow-md p-4"
      style={{ minHeight: "calc(100vh - 6rem)" }}
    >
      <div className="flex justify-center">
        <Creator creator={creator} />
      </div>
      {/* Optionally show date above content */}
      {date && (
        <div className="flex justify-center">
          <ShowDate date={date} />
        </div>
      )}
      <div>
        <div className="bg-gray-50 rounded p-3 text-gray-900 whitespace-pre-line break-all max-h-100 overflow-y-auto">
          {content}
        </div>
      </div>
      {/* Priority and Type row */}
      <div className="flex gap-2">
        <div className={`${caseBoxClasses} ${priorityStyle} flex-1`}>
          <span className={labelTextClass}>{t("priority")}:</span>
          <span className="flex items-center px-2 py-0.5">
            <FlagIcon className="h-4 w-4" /> {t(priority)}
          </span>
        </div>
        <div className={`${caseBoxClasses} ${typeBadgeStyle} flex-1`}>
          <span className={labelTextClass}>{t("type")}:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs text-center font-medium ${typeBadgeStyle}`}
          >
            {t(type)}
          </span>
        </div>
      </div>
      {/* Status and Rating row */}
      <div className="flex gap-2">
        <div className={`${caseBoxClasses} flex-1`}>
          <span className={labelTextClass}>{t("status")}:</span>
          <span className="flex items-center">
            <span
              className={`h-2.5 w-2.5 rounded-full ${statusStyle.dotBgColor}`}
            />
            <span className={`${statusStyle.textColor} px-1 py-0.5`}>
              {t(status)}
            </span>
          </span>
        </div>
        <CaseRating
          ratings={rating}
          t={t}
          caseId={caseId}
          me={me}
          refetch={refetch}
        />
      </div>
      <div className={`${caseBoxClasses} flex-col bg-white`}>
        <span className={labelTextClass}>{t("categories")}:</span>
        <span className="flex flex-wrap gap-1">
          {categories.length > 0 ? (
            categories.map((cat: ICategory) => (
              <CategoryLink key={cat._id} {...cat} />
            ))
          ) : (
            <span className="text-gray-400 italic">{t("no_categories")}</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default CaseInfo;
