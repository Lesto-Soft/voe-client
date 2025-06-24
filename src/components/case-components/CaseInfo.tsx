// src/components/case-components/CaseInfo.tsx (Updated)
import React, { useState } from "react";
import {
  ICategory,
  IMe,
  IRating,
  IMetricScore,
  IUser,
} from "../../db/interfaces";
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
import { CASE_STATUS, USER_RIGHTS } from "../../utils/GLOBAL_PARAMETERS";
import CaseDialog from "../modals/CaseDialog";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useGetActiveCategories } from "../../graphql/hooks/category";
import { renderContentSafely } from "../../utils/contentRenderer";
import RateCaseModal from "../modals/RateCaseModal";

// --- MOCK DATA (Remains the same) ---
const mockUser1: IUser = {
  _id: "user1",
  name: "John Doe",
  username: "j.doe",
  role: {} as any,
};
const mockUser2: IUser = {
  _id: "user2",
  name: "Jane Smith",
  username: "j.smith",
  role: {} as any,
};
const mockUser3: IUser = {
  _id: "user3",
  name: "Peter Jones",
  username: "p.jones",
  role: {} as any,
};
const mockUser4: IUser = {
  _id: "user4",
  name: "Maria Garcia",
  username: "m.garcia",
  role: {} as any,
};
const mockUser5: IUser = {
  _id: "user5",
  name: "Chen Wei",
  username: "c.wei",
  role: {} as any,
};
const mockUser6: IUser = {
  _id: "user6",
  name: "Fatima Al-Fassi",
  username: "f.alfassi",
  role: {} as any,
};
const mockUser7: IUser = {
  _id: "user7",
  name: "David Miller",
  username: "d.miller",
  role: {} as any,
};

const mockCommunityRatings: IRating[] = [
  {
    _id: "rating1",
    user: mockUser1,
    case: { _id: "case1" } as any,
    overallScore: 5,
    scores: [
      { metricName: "Adequacy", score: 5 },
      { metricName: "Impact", score: 4 },
      { metricName: "Efficiency", score: 5 },
    ],
  },
  {
    _id: "rating2",
    user: mockUser2,
    case: { _id: "case1" } as any,
    overallScore: 4,
    scores: [
      { metricName: "Adequacy", score: 4 },
      { metricName: "Impact", score: 5 },
    ],
  },
  {
    _id: "rating3",
    user: mockUser3,
    case: { _id: "case1" } as any,
    overallScore: 3,
    scores: [],
  },
  {
    _id: "rating4",
    user: mockUser4,
    case: { _id: "case1" } as any,
    overallScore: 4,
    scores: [
      { metricName: "Adequacy", score: 4 },
      { metricName: "Impact", score: 4 },
      { metricName: "Efficiency", score: 4 },
    ],
  },
  {
    _id: "rating5",
    user: mockUser5,
    case: { _id: "case1" } as any,
    overallScore: 2,
    scores: [
      { metricName: "Adequacy", score: 1 },
      { metricName: "Impact", score: 2 },
    ],
  },
  {
    _id: "rating6",
    user: mockUser6,
    case: { _id: "case1" } as any,
    overallScore: 5,
    scores: [
      { metricName: "Adequacy", score: 5 },
      { metricName: "Impact", score: 5 },
      { metricName: "Efficiency", score: 5 },
    ],
  },
  {
    _id: "rating7",
    user: mockUser7,
    case: { _id: "case1" } as any,
    overallScore: 4,
    scores: [],
  },
  {
    _id: "rating8",
    user: mockUser1,
    case: { _id: "case1" } as any,
    overallScore: 4,
    scores: [
      { metricName: "Adequacy", score: 4 },
      { metricName: "Impact", score: 3 },
      { metricName: "Efficiency", score: 4 },
    ],
  },
  {
    _id: "rating9",
    user: mockUser2,
    case: { _id: "case1" } as any,
    overallScore: 5,
    scores: [{ metricName: "Efficiency", score: 5 }],
  },
  {
    _id: "rating10",
    user: mockUser4,
    case: { _id: "case1" } as any,
    overallScore: 4,
    scores: [
      { metricName: "Adequacy", score: 5 },
      { metricName: "Impact", score: 4 },
    ],
  },
];
// --- END MOCK DATA ---

interface ICaseInfoProps {
  content: string;
  caseId: string;
  type: "PROBLEM" | "SUGGESTION";
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: string;
  categories: ICategory[];
  creator: any;
  rating: IRating[];
  date?: string;
  me: IMe;
  caseNumber: number;
  refetch: () => void;
  attachments?: string[];
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
  rating, // This prop now holds the "real" data, but we use the mock data below
  date,
  me,
  caseNumber,
  refetch,
  attachments = [],
  rights = [],
}) => {
  const { t } = useTranslation("dashboard");
  const [isRatingModalOpen, setRatingModalOpen] = useState(false);

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

  const handleRatingSubmit = async (ratingData: {
    overallScore: number;
    scores: IMetricScore[];
  }) => {
    console.log("Submitting rating from modal:", ratingData);
    // Here you would call your GraphQL mutation
    // await rateCase({ variables: { caseId, userId: me._id, ...ratingData } });
    // refetch();
  };

  const { categories: categoriesDataFromHook } = useGetActiveCategories();

  // NOTE: The line below uses the REAL rating prop.
  // For the demo, we pass the MOCK data to the modal instead.
  const currentUserRating = rating.find((r) => r.user._id === me._id);

  return (
    <>
      <div className="flex flex-col gap-4 bg-white shadow-md p-4 w-full h-full lg:overflow-y-auto custom-scrollbar">
        {/* Creator & Date */}
        <div className="flex flex-col items-center gap-1">
          <Creator creator={creator} />
          {date && <ShowDate date={date} centered={true} />}
        </div>

        {/* Content Section */}
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
                      className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <PencilSquareIcon className="h-5 w-5 text-gray-500" />
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

        {/* Attachments Section */}
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

        {/* Info Boxes */}
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

          {/* Minimalist Rating Component */}
          <div className="grow basis-[140px] sm:basis-[160px] lg:w-[calc(50%-0.5rem)] lg:basis-auto">
            <CaseRating
              ratings={mockCommunityRatings}
              onOpenModal={() => setRatingModalOpen(true)}
              disabled={isCurrentUserCreator}
            />
          </div>
        </div>

        {/* Categories Section */}
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

      {/* The RateCaseModal is rendered here, controlled by local state */}
      <RateCaseModal
        isOpen={isRatingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        caseNumber={caseNumber}
        // Pass the corrected mock data to the modal for demonstration
        caseRatings={mockCommunityRatings}
        currentUserRating={currentUserRating}
      />
    </>
  );
};

export default CaseInfo;
