// src/components/case-components/CaseInfo.tsx (Modified to be responsive)
import React from "react";
import { ICategory, IMe } from "../../db/interfaces";
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
import ImagePreviewModal from "../modals/ImagePreviewModal";
import { createFileUrl } from "../../utils/fileUtils";
import FullScreenContentDialog from "../modals/ContentDialog";
import EditCaseDialog from "../modals/EditCaseDialog";
import { CASE_STATUS, USER_RIGHTS } from "../../utils/GLOBAL_PARAMETERS";
import CaseDialog from "../modals/CaseDialog";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useGetActiveCategories } from "../../graphql/hooks/category";
import { renderContentSafely } from "../../utils/contentRenderer";

interface ICaseInfoProps {
  content: string;
  caseId: string;
  type: "PROBLEM" | "SUGGESTION";
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: string;
  categories: ICategory[];
  creator: any;
  rating: any;
  date?: string;
  me: IMe;
  caseNumber: number;
  refetch: () => void;
  attachments?: string[];
  rights: string[];
  // availableCategories: ICategory[];
}

const CaseInfo: React.FC<ICaseInfoProps> = ({
  content,
  caseId,
  type,
  priority,
  status,
  categories,
  creator,
  rating,
  date,
  me,
  caseNumber,
  refetch,
  attachments = [],
  rights = [],
  // availableCategories,
}) => {
  const { t } = useTranslation("dashboard");
  const statusStyle = getStatusStyle(status);
  const priorityStyle = getPriorityStyle(priority);
  const typeBadgeStyle = getTypeBadgeStyle(type);
  const isCurrentUserCreator = creator?._id === me?._id;
  const caseInitialDataForEdit = {
    content,
    type,
    priority,
    status,
    categories,
    attachments,
  };

  const {
    categories: categoriesDataFromHook,
    loading: categoriesLoading,
    error: categoriesError,
  } = useGetActiveCategories();

  return (
    <div className="flex flex-col gap-4 bg-white shadow-md p-4 w-full h-full lg:overflow-y-auto custom-scrollbar">
      {/* Creator & Date */}
      <div className="flex flex-col items-center gap-2">
        <Creator creator={creator} />
        {date && <ShowDate date={date} />}
      </div>
      <div>
        <div className="flex justify-between items-center mb-1.5 px-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("content")}
          </h3>
          <div className="hidden lg:flex lg:gap-2">
            {(rights.includes(USER_RIGHTS.CREATOR) ||
              rights.includes(USER_RIGHTS.ADMIN) ||
              rights.includes(USER_RIGHTS.MANAGER)) &&
              status !== CASE_STATUS.AWAITING_FINANCE &&
              status !== CASE_STATUS.CLOSED && (
                <CaseDialog
                  mode="edit"
                  caseId={caseId}
                  caseNumber={caseNumber}
                  initialData={{
                    content: caseInitialDataForEdit.content,
                    priority: caseInitialDataForEdit.priority,
                    type: caseInitialDataForEdit.type,
                    categories: caseInitialDataForEdit.categories,
                    attachments: caseInitialDataForEdit.attachments.map(
                      (a) => a
                    ),
                  }}
                  me={me}
                  availableCategories={categoriesDataFromHook || []}
                >
                  <button
                    type="button"
                    title="Edit case"
                    className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:cursor-pointer"
                  >
                    <PencilSquareIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </CaseDialog>
              )}
            {/* --- MODIFIED CALL TO PASS ALL DATA --- */}
            <FullScreenContentDialog
              content={content}
              title={`${t("case", "Сигнал")} #${caseNumber}`}
              creator={creator}
              date={date}
              type={type}
              priority={priority}
              categories={categories}
              rating={rating}
              attachments={attachments}
              caseId={caseId}
              me={me}
              refetch={refetch}
              isCurrentUserCreator={isCurrentUserCreator}
            />
          </div>
        </div>
        <div className="bg-gray-50 rounded-md p-3 text-gray-900 overflow-y-auto custom-scrollbar max-h-60 lg:max-h-70 break-words">
          {renderContentSafely(content)}
        </div>
      </div>
      {/* ... (rest of the CaseInfo component remains the same) ... */}
      {attachments && attachments.length > 0 && (
        <div className="hidden lg:flex flex-wrap gap-2 mb-2">
          {attachments.map((file) => (
            <ImagePreviewModal
              key={file}
              imageUrl={createFileUrl("cases", caseId, file)}
              fileName={file}
            />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        {/* Priority */}
        <div
          className={`
    ${caseBoxClasses} ${priorityStyle} 
    grow basis-[140px]
    sm:basis-[160px]
    lg:w-[calc(50%-0.5rem)] lg:basis-auto
  `}
        >
          <span className={labelTextClass}>{t("priority")}:</span>
          <span className="flex items-center mt-0.5 sm:mt-1">
            <FlagIcon className="h-4 w-4 mr-1.5" />
            {t(priority)}
          </span>
        </div>
        {/* Type */}
        <div
          className={`
    ${caseBoxClasses} ${typeBadgeStyle} 
    grow basis-[140px]
    sm:basis-[160px]
    lg:w-[calc(50%-0.5rem)] lg:basis-auto
  `}
        >
          <span className={labelTextClass}>{t("type")}:</span>
          <div className="mt-0.5 sm:mt-1">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs text-center font-medium ${typeBadgeStyle}`}
            >
              {t(type)}
            </span>
          </div>
        </div>
        {/* Status */}
        <div
          className={`
    ${caseBoxClasses} 
    grow basis-[140px]
    sm:basis-[160px]
    lg:w-[calc(50%-0.5rem)] lg:basis-auto
  `}
        >
          <span className={labelTextClass}>{t("status")}:</span>
          <span className="flex items-center mt-0.5 sm:mt-1">
            <span
              className={`h-2.5 w-2.5 rounded-full ${statusStyle.dotBgColor} mr-1.5`}
            />
            <span className={`${statusStyle.textColor}`}>{t(status)}</span>
          </span>
        </div>
        {/* Rating */}
        <div
          className={`
    ${caseBoxClasses} 
    grow basis-[140px]
    sm:basis-[160px]
    lg:w-[calc(50%-0.5rem)] lg:basis-auto
  `}
        >
          <CaseRating
            ratings={rating}
            t={t}
            caseId={caseId}
            me={me}
            refetch={refetch}
            disabled={isCurrentUserCreator}
          />
        </div>
      </div>
      {/* Categories */}
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
