// src/components/modals/ContentDialog.tsx (Updated)

import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { ArrowTopRightOnSquareIcon, FlagIcon } from "@heroicons/react/24/solid";
import { renderContentSafely } from "../../utils/contentRenderer";
import { ICategory, IMe, IMetricScore, IUser } from "../../db/interfaces"; // UPDATED
import Creator from "../case-components/Creator";
import ShowDate from "../global/ShowDate";
import CaseRatingDisplay from "../case-components/CaseRatingDisplay"; // UPDATED
import CategoryLink from "../global/CategoryLink";
import ImagePreviewModal from "./ImagePreviewModal";
import { createFileUrl } from "../../utils/fileUtils";
import { getPriorityStyle, getTypeBadgeStyle } from "../../utils/style-helpers";
import { labelTextClass, caseBoxClasses } from "../../ui/reusable-styles";
import { useMemo } from "react";

// --- UPDATED Props Interface ---
interface ContentDialogProps {
  content: string;
  title: string;
  creator: IUser;
  date?: string;
  type: "PROBLEM" | "SUGGESTION";
  priority: "LOW" | "MEDIUM" | "HIGH";
  categories: ICategory[];
  metricScores?: IMetricScore[]; // UPDATED
  calculatedRating?: number | null; // UPDATED
  attachments?: string[];
  caseId: string;
  me: IMe;
  refetch: () => void;
  isCurrentUserCreator: boolean;
}

const ContentDialog: React.FC<ContentDialogProps> = ({
  content,
  title,
  creator,
  date,
  type,
  priority,
  categories,
  metricScores = [], // UPDATED
  calculatedRating, // UPDATED
  attachments = [],
  caseId,
  me,
  refetch,
  isCurrentUserCreator,
}) => {
  const { t } = useTranslation(["modals", "dashboard"]);
  const priorityStyle = getPriorityStyle(priority);
  const typeBadgeStyle = getTypeBadgeStyle(type);

  // --- NEW: We calculate this here as well to pass to the display component ---
  const hasUserRated = useMemo(
    () => metricScores.some((score) => score.user._id === me._id),
    [metricScores, me._id]
  );

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="hidden lg:flex p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition hover:cursor-pointer"
          type="button"
          aria-label={t("showFullScreen") || "Show full screen"}
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed z-50 inset-4 md:inset-12 lg:inset-24 bg-white rounded-lg shadow-2xl flex flex-col focus:outline-none">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-200 flex-shrink-0">
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 focus:outline-none hover:cursor-pointer"
                aria-label="Close"
                type="button"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
            <Dialog.Title className="text-xl font-bold text-gray-800">
              {title}
            </Dialog.Title>
          </div>

          {/* Body with two columns */}
          <div className="flex-grow flex flex-col md:flex-row gap-6 overflow-hidden p-4">
            {/* Left Column: Metadata */}
            <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
              <div className="flex flex-col items-center justify-center w-full gap-1">
                <Creator creator={creator} />
                {date && <ShowDate date={date} centered={true} />}
              </div>

              {/* Info boxes */}
              <div className="flex flex-col gap-3">
                <div className={`${caseBoxClasses} ${priorityStyle} flex-1`}>
                  <span className={labelTextClass}>
                    {t("dashboard:priority")}:
                  </span>
                  <span className="flex items-center mt-1">
                    <FlagIcon className="h-4 w-4 mr-1.5" />
                    {t(`dashboard:${priority}`)}
                  </span>
                </div>
                <div className={`${caseBoxClasses} ${typeBadgeStyle} flex-1`}>
                  <span className={labelTextClass}>{t("dashboard:type")}:</span>
                  <div className="mt-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs text-center font-medium ${typeBadgeStyle}`}
                    >
                      {t(`dashboard:${type}`)}
                    </span>
                  </div>
                </div>
                {/* --- UPDATED: Rating Display Component --- */}
                <div className={`${caseBoxClasses}`}>
                  <CaseRatingDisplay
                    metricScores={metricScores}
                    calculatedRating={calculatedRating}
                    onOpenModal={() => {
                      /* The modal is opened from the main page, not the dialog */
                    }}
                    disabled={true} // The button to add/edit a rating is disabled inside the dialog
                    hasUserRated={hasUserRated}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className={`${caseBoxClasses} flex-col`}>
                <span className={labelTextClass}>
                  {t("dashboard:categories")}:
                </span>
                <span className="flex flex-wrap gap-1 mt-1">
                  {categories.length > 0 ? (
                    categories.map((cat: ICategory) => (
                      <CategoryLink key={cat._id} {...cat} />
                    ))
                  ) : (
                    <span className="text-gray-400 italic">
                      {t("dashboard:no_categories")}
                    </span>
                  )}
                </span>
              </div>
              {/* Attachments */}
              {attachments && attachments.length > 0 && (
                <div className={`${caseBoxClasses} flex-col`}>
                  <span className={labelTextClass}>
                    {t("dashboard:attachments")}:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {attachments.map((file) => (
                      <ImagePreviewModal
                        key={file}
                        imageUrl={createFileUrl("cases", caseId, file)}
                        fileName={file}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Main Content */}
            <div className="flex-grow md:w-2/3 lg:w-3/4 flex flex-col gap-4 border-l border-gray-100 pl-6">
              <div className="font-normal text-gray-500">
                {t("dashboard:content")}
              </div>
              <div className="bg-gray-50 rounded-md p-4 text-gray-900 overflow-y-auto custom-scrollbar break-words flex-grow">
                {renderContentSafely(content)}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ContentDialog;
