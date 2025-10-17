// src/components/case-components/CaseInfo.tsx (Corrected)

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ApolloError } from "@apollo/client";
import { ICategory, IMe, IMetricScore } from "../../db/interfaces";
import CategoryLink from "../global/links/CategoryLink";
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
import ImagePreviewModal, {
  GalleryItem,
} from "../modals/imageModals/ImagePreviewModal";
import { createFileUrl } from "../../utils/fileUtils";
import ContentDialog from "../modals/caseModals/ContentDialog";
import { CASE_STATUS, USER_RIGHTS } from "../../utils/GLOBAL_PARAMETERS";
import { useGetActiveCategories } from "../../graphql/hooks/category";
import { renderContentSafely } from "../../utils/contentRenderer";
import RateCaseModal from "../modals/caseModals/RateCaseModal";
import CaseRatingDisplay from "./CaseRatingDisplay";
import { IReadBy } from "../../db/interfaces";
import { EyeIcon } from "@heroicons/react/24/outline";
import CaseReadByModal from "../modals/caseModals/CaseReadByModal";
import CaseDialog from "../modals/caseModals/CaseDialog";

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
  readBy?: IReadBy[];
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
  readBy = [],
}) => {
  const { t } = useTranslation("dashboard");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isRatingModalOpen, setRatingModalOpen] = useState(false);
  // 2. ADD STATE FOR THE NEW MODAL
  const [isReadByModalOpen, setReadByModalOpen] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Check if the content height is greater than the container's visible height
      const isOverflowing = container.scrollHeight > container.clientHeight;

      // Check if the user has scrolled to the very bottom (with a 1px tolerance)
      const isAtBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 1;

      // Show the shadow only if the content is overflowing AND we are not at the bottom
      setIsScrolled(isOverflowing && !isAtBottom);
    };

    // Use a ResizeObserver to re-check when the container size or content changes
    const observer = new ResizeObserver(handleScroll);
    observer.observe(container);

    // Add the scroll event listener
    container.addEventListener("scroll", handleScroll);

    // Run once on mount to set the initial state correctly
    handleScroll();

    // Clean up listeners when the component unmounts
    return () => {
      container.removeEventListener("scroll", handleScroll);
      observer.unobserve(container);
    };
  }, []); // Empty array ensures this setup runs only once

  // --- THIS LINE IS NOW CORRECT ---
  const { categories: categoriesDataFromHook } = useGetActiveCategories();

  const statusStyle = getStatusStyle(status);
  const priorityStyle = getPriorityStyle(priority);
  const typeBadgeStyle = getTypeBadgeStyle(type);

  const hasUserRated = useMemo(
    () => metricScores.some((score) => score.user._id === me._id),
    [metricScores, me._id]
  );

  // 1. ADD THIS useMemo TO CREATE THE GALLERY ITEMS
  const galleryItems: GalleryItem[] = useMemo(() => {
    return attachments.map((file) => ({
      url: createFileUrl("cases", caseId, file),
      name: file,
    }));
  }, [attachments, caseId]);

  const canViewReadBy =
    rights.includes("admin") ||
    rights.includes("manager") ||
    rights.includes("expert");

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
      {/* MODIFIED: The entire panel is now one scrollable container.
          Flexbox classes have been removed. */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full bg-white shadow-md overflow-y-auto custom-scrollbar-xs"
      >
        {/* --- Top and Middle sections are in a simple content wrapper --- */}
        <div className="p-4 flex flex-col gap-3">
          {/* Top Section */}
          <div className="flex flex-col items-center gap-1">
            <Creator creator={creator} />
            {date && <ShowDate date={date} centered={true} isCase={true} />}
          </div>

          {/* Middle Section */}
          {/* Content Box */}
          <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
              <h3 className="text-sm font-semibold text-gray-400">
                {t("content")}:
              </h3>
              <div className="flex items-center lg:gap-2">
                {/* Added items-center */}
                {/* 4. ADD THE TRIGGER BUTTON HERE */}
                {canViewReadBy && (
                  <button
                    type="button"
                    title="Виж кой е прочел сигнала"
                    onClick={() => setReadByModalOpen(true)}
                    className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:cursor-pointer"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                )}
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
                        title="Редактирай сигнала"
                        className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:cursor-pointer"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    </CaseDialog>
                  )}
                <ContentDialog
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
            <div className="bg-gray-50 rounded-md p-3 text-gray-900 break-words">
              {renderContentSafely(content)}
            </div>
          </div>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file) => (
                <ImagePreviewModal
                  key={file}
                  galleryItems={galleryItems}
                  imageUrl={createFileUrl("cases", caseId, file)}
                  fileName={file}
                />
              ))}
            </div>
          )}
        </div>

        {/* --- Bottom Section (Now Sticky) --- */}
        {/* MODIFIED: This wrapper is now sticky. It scrolls with the content until
            it hits the bottom of the container, where it will "stick".
            The background color is important so content doesn't show through. */}
        <div
          className={`sticky bottom-0 bg-white p-4 pt-2 transition-shadow duration-200 ${
            isScrolled
              ? "shadow-[0_-5px_10px_-5px_rgba(0,0,0,0.1)] border-t border-gray-200"
              : ""
          }`}
        >
          <div className="flex flex-col gap-3">
            {/* Info Grid (Priority, Type, etc.) */}
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
                  <span className={`${statusStyle.textColor}`}>
                    {t(status)}
                  </span>
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

            {/* Categories */}
            <div className={`${caseBoxClasses} flex-col bg-white`}>
              <span className={labelTextClass}>{t("categories")}:</span>
              <span className="flex flex-wrap gap-1">
                {categories.length > 0 ? (
                  categories.map((cat: ICategory) => (
                    <CategoryLink key={cat._id} {...cat} />
                  ))
                ) : (
                  <span className="text-gray-400 italic">
                    {t("no_categories")}
                  </span>
                )}
              </span>
            </div>
          </div>
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
        errorScores={error}
      />

      <CaseReadByModal
        isOpen={isReadByModalOpen}
        onClose={() => setReadByModalOpen(false)}
        readByData={readBy}
        caseNumber={caseNumber}
      />
    </>
  );
};

// <>
//       <div className="flex flex-col bg-white shadow-md p-4 w-full h-full">

//         {/* MODIFIED: This scrollable container now wraps BOTH the header and the middle content. */}
//         <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar min-h-0">
//           {/* --- Top Section (MOVED) --- */}
//           {/* This part is now inside the scrollable area. */}
//           <div className="flex flex-col items-center gap-1">
//             <Creator creator={creator} />
//             {date && <ShowDate date={date} centered={true} isCase={true} />}
//           </div>

//           {/* --- Middle Section --- */}
//           {/* Content Box */}
//           <div>
//             <div className="flex justify-between items-center mb-1.5 px-1">
//               <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                 {t("content")}
//               </h3>
//               <div className="flex lg:gap-2">
//                 {(rights.includes(USER_RIGHTS.CREATOR) ||
//                   rights.includes(USER_RIGHTS.ADMIN) ||
//                   rights.includes(USER_RIGHTS.MANAGER)) &&
//                   status !== CASE_STATUS.AWAITING_FINANCE &&
//                   status !== CASE_STATUS.CLOSED && (
//                     <CaseDialog
//                       mode="edit"
//                       caseId={caseId}
//                       caseNumber={caseNumber}
//                       initialData={{
//                         content: caseInitialDataForEdit.content,
//                         priority: caseInitialDataForEdit.priority,
//                         type: caseInitialDataForEdit.type,
//                         categories: caseInitialDataForEdit.categories,
//                         attachments: caseInitialDataForEdit.attachments.map(
//                           (a) => a
//                         ),
//                       }}
//                       me={me}
//                       availableCategories={categoriesDataFromHook || []}
//                     >
//                       <button
//                         type="button"
//                         title="Edit case"
//                         className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:cursor-pointer"
//                       >
//                         <PencilSquareIcon className="h-5 w-5" />
//                       </button>
//                     </CaseDialog>
//                   )}
//                 <FullScreenContentDialog
//                   content={content}
//                   title={`${t("case", "Сигнал")} #${caseNumber}`}
//                   creator={creator}
//                   date={date}
//                   type={type}
//                   priority={priority}
//                   categories={categories}
//                   metricScores={metricScores}
//                   calculatedRating={calculatedRating}
//                   attachments={attachments}
//                   caseId={caseId}
//                   me={me}
//                   refetch={refetch}
//                   isCurrentUserCreator={isCurrentUserCreator}
//                 />
//               </div>
//             </div>
//             <div className="bg-gray-50 rounded-md p-3 text-gray-900 break-words">
//               {renderContentSafely(content)}
//             </div>
//           </div>

//           {/* Attachments */}
//           {attachments && attachments.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {attachments.map((file) => (
//                 <ImagePreviewModal
//                   key={file}
//                   imageUrl={createFileUrl("cases", caseId, file)}
//                   fileName={file}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* --- Bottom Section (Static Height) --- */}
//         {/* This part remains outside and below the scrollable area.
//             A top margin is added for spacing. */}
//         <div className="flex-shrink-0 flex flex-col gap-3 pt-3">
//           {/* Info Grid (Priority, Type, etc.) */}
//           <div className="flex flex-wrap gap-x-4 gap-y-3">
//             <div
//               className={`${caseBoxClasses} ${priorityStyle} grow basis-[140px] sm:basis-[160px] lg:w-[calc(50%-0.5rem)] lg:basis-auto`}
//             >
//               <span className={labelTextClass}>{t("priority")}:</span>
//               <span className="flex items-center mt-0.5 sm:mt-1">
//                 <FlagIcon className="h-4 w-4 mr-1.5" />
//                 {t(priority)}
//               </span>
//             </div>
//             <div
//               className={`${caseBoxClasses} ${typeBadgeStyle} grow basis-[140px] sm:basis-[160px] lg:w-[calc(50%-0.5rem)] lg:basis-auto`}
//             >
//               <span className={labelTextClass}>{t("type")}:</span>
//               <div className="mt-0.5 sm:mt-1">
//                 <span
//                   className={`px-2.5 py-0.5 rounded-full text-xs text-center font-medium ${typeBadgeStyle}`}
//                 >
//                   {t(type)}
//                 </span>
//               </div>
//             </div>
//             <div
//               className={`${caseBoxClasses} grow basis-[140px] sm:basis-[160px] lg:w-[calc(50%-0.5rem)] lg:basis-auto`}
//             >
//               <span className={labelTextClass}>{t("status")}:</span>
//               <span className="flex items-center mt-0.5 sm:mt-1">
//                 <span
//                   className={`h-2.5 w-2.5 rounded-full ${statusStyle.dotBgColor} mr-1.5`}
//                 />
//                 <span className={`${statusStyle.textColor}`}>{t(status)}</span>
//               </span>
//             </div>
//             <div className="grow basis-[140px] sm:basis-[160px] lg:w-[calc(50%-0.5rem)] lg:basis-auto">
//               <CaseRatingDisplay
//                 metricScores={metricScores}
//                 calculatedRating={calculatedRating}
//                 onOpenModal={() => setRatingModalOpen(true)}
//                 disabled={isCurrentUserCreator}
//                 hasUserRated={hasUserRated}
//               />
//             </div>
//           </div>

//           {/* Categories */}
//           <div className={`${caseBoxClasses} flex-col bg-white`}>
//             <span className={labelTextClass}>{t("categories")}:</span>
//             <span className="flex flex-wrap gap-1">
//               {categories.length > 0 ? (
//                 categories.map((cat: ICategory) => (
//                   <CategoryLink key={cat._id} {...cat} />
//                 ))
//               ) : (
//                 <span className="text-gray-400 italic">
//                   {t("no_categories")}
//                 </span>
//               )}
//             </span>
//           </div>
//         </div>
//       </div>

//       <RateCaseModal
//         isOpen={isRatingModalOpen}
//         onClose={() => setRatingModalOpen(false)}
//         onSuccessfulSubmit={handleSuccessfulRatingSubmit}
//         caseId={caseId}
//         caseNumber={caseNumber}
//         currentUser={me}
//         caseScores={metricScores}
//         isLoadingScores={isLoading}
//         errorScores={error}
//       />
//     </>

export default CaseInfo;
