// src/components/case-components/CaseInfo.tsx (Corrected)

import React, { useState, useMemo } from "react";
import { ApolloError } from "@apollo/client";
import { ICategory, IMe, IMetricScore } from "../../db/interfaces";
import CategoryLink from "../global/CategoryLink";
import { FlagIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import {
  getPriorityStyle,
  getStatusStyle,
  getTypeBadgeStyle,
} from "../../utils/style-helpers";
import { labelTextClass, caseBoxClasses } from "../../ui/reusable-styles";
import { useTranslation } from "react-i18next";
import Creator from "./Creator";
import ShowDate from "../global/ShowDate";
import ImagePreviewModal from "../modals/ImagePreviewModal";
import { createFileUrl } from "../../utils/fileUtils";
import FullScreenContentDialog from "../modals/ContentDialog";
import { CASE_STATUS, USER_RIGHTS } from "../../utils/GLOBAL_PARAMETERS";
import CaseDialog from "../modals/CaseDialog";
import { useGetActiveCategories } from "../../graphql/hooks/category";
import { renderContentSafely } from "../../utils/contentRenderer";
import RateCaseModal from "../modals/RateCaseModal";
import CaseRatingDisplay from "./CaseRatingDisplay";

interface ICaseInfoProps {
  content: string;
  caseId: string;
  type: "PROBLEM" | "SUGGESTION";
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: string;
  categories: ICategory[];
  creator: any;
  metricScores?: IMetricScore[];
  calculatedRating?: number | null;
  date?: string;
  me: IMe;
  caseNumber: number;
  refetch: () => void;
  attachments?: string[];
  isLoading: boolean;
  error?: ApolloError | undefined; // <-- ADD THIS PROP
  rights: string[];
}

const CaseInfo: React.FC<ICaseInfoProps> = ({
  content,
  caseId,
  type,
  priority,
  status,
  categories,
  creator,
  metricScores = [],
  calculatedRating,
  date,
  me,
  caseNumber,
  refetch,
  attachments = [],
  rights = [],
  isLoading,
  error,
}) => {
  const { t } = useTranslation("dashboard");
  const [isRatingModalOpen, setRatingModalOpen] = useState(false);

  // --- THIS LINE IS NOW CORRECT ---
  const { categories: categoriesDataFromHook } = useGetActiveCategories();

  const statusStyle = getStatusStyle(status);
  const priorityStyle = getPriorityStyle(priority);
  const typeBadgeStyle = getTypeBadgeStyle(type);

  const hasUserRated = useMemo(
    () => metricScores.some((score) => score.user._id === me._id),
    [metricScores, me._id]
  );

  const isCurrentUserCreator = creator?._id === me._id;

  const caseInitialDataForEdit = {
    content,
    type,
    priority,
    status,
    categories,
    attachments,
  };

  const handleSuccessfulRatingSubmit = () => {
    refetch();
  };

  return (
    <>
      <div className="flex flex-col gap-4 bg-white shadow-md p-4 w-full h-full lg:overflow-y-auto custom-scrollbar">
        <div className="flex flex-col items-center gap-1">
          <Creator creator={creator} />
          {date && <ShowDate date={date} centered={true} />}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5 px-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("content")}
            </h3>
            <div className="flex lg:gap-2">
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
                      className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:cursor-pointer"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </CaseDialog>
                )}
              <FullScreenContentDialog
                content={content}
                title={`${t("case", "Сигнал")} #${caseNumber}`}
                creator={creator}
                date={date}
                type={type}
                priority={priority}
                categories={categories}
                metricScores={metricScores}
                calculatedRating={calculatedRating}
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

        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
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
          <div
            className={`${caseBoxClasses} ${priorityStyle} grow basis-[140px] sm:basis-[160px] lg:w-[calc(50%-0.5rem)] lg:basis-auto`}
          >
            <span className={labelTextClass}>{t("priority")}:</span>
            <span className="flex items-center mt-0.5 sm:mt-1">
              <FlagIcon className="h-4 w-4 mr-1.5" />
              {t(priority)}
            </span>
          </div>
          <div
            className={`${caseBoxClasses} ${typeBadgeStyle} grow basis-[140px] sm:basis-[160px] lg:w-[calc(50%-0.5rem)] lg:basis-auto`}
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
          <div
            className={`${caseBoxClasses} grow basis-[140px] sm:basis-[160px] lg:w-[calc(50%-0.5rem)] lg:basis-auto`}
          >
            <span className={labelTextClass}>{t("status")}:</span>
            <span className="flex items-center mt-0.5 sm:mt-1">
              <span
                className={`h-2.5 w-2.5 rounded-full ${statusStyle.dotBgColor} mr-1.5`}
              />
              <span className={`${statusStyle.textColor}`}>{t(status)}</span>
            </span>
          </div>
          <div className="grow basis-[140px] sm:basis-[160px] lg:w-[calc(50%-0.5rem)] lg:basis-auto">
            <CaseRatingDisplay
              metricScores={metricScores}
              calculatedRating={calculatedRating}
              onOpenModal={() => setRatingModalOpen(true)}
              disabled={isCurrentUserCreator}
              hasUserRated={hasUserRated}
            />
          </div>
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

      <RateCaseModal
        isOpen={isRatingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        onSuccessfulSubmit={handleSuccessfulRatingSubmit}
        caseId={caseId}
        caseNumber={caseNumber}
        currentUser={me}
        caseScores={metricScores}
        isLoadingScores={isLoading}
        errorScores={error} // <-- PASS THE PROP HERE
      />
    </>
  );
};

export default CaseInfo;
