import React, { useState } from "react";
import { useGetCaseByCaseNumber } from "../graphql/hooks/case";
import { useParams } from "react-router";
import {
  PaperClipIcon,
  UserCircleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { FlagIcon } from "@heroicons/react/24/solid";
import { ICase, ICategory, IComment, IAnswer, IRating } from "../db/interfaces";
import { useTranslation } from "react-i18next";
import CaseHistoryModal from "../components/modals/HistoryModal";
import Answer from "../components/case-components/Answer";
import Comment from "../components/case-components/Comment";
import UserLink from "../components/global/UserLink";
import CategoryLink from "../components/global/CategoryLink";
import ShowDate from "../components/global/ShowDate";
import EditButton from "../components/global/EditButton";
import { useGetMe } from "../graphql/hooks/user";
import { admin_check } from "../utils/rowStringCheckers";

// --- Rating Component ---
const CaseRating: React.FC<{
  ratings?: IRating[];
  onRate?: (rating: number) => void;
  disabled?: boolean;
}> = ({ ratings = [], onRate, disabled }) => {
  // Calculate average rating
  const avg =
    ratings.length > 0
      ? Math.round(
          ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
        )
      : 0;
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number>(avg);

  const handleClick = (star: number) => {
    console.log(star);
    if (disabled) return;
    setSelected(star);
    onRate?.(star);
  };

  return (
    <div className="">
      {[5, 4, 3, 2, 1].reverse().map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleClick(star)}
          disabled={disabled}
          aria-label={`Rate ${star}`}
        >
          <span
            className={`inline-block transition-transform duration-150 hover:cursor-pointer ${
              hovered === star
                ? "scale-125"
                : hovered && star <= hovered
                ? "scale-110"
                : ""
            }`}
          >
            <StarIcon
              className={`h-5 w-5 transition-colors duration-150 ${
                (hovered ?? selected) >= star
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              fill={(hovered ?? selected) >= star ? "#facc15" : "none"}
              stroke="currentColor"
            />
          </span>
        </button>
      ))}
      <span className="mr-2 text-sm text-gray-500">
        {ratings.length > 0 ? `(${ratings.length})` : ""}
      </span>
    </div>
  );
};

const Case = () => {
  const { t } = useTranslation("dashboard");
  const { number } = useParams<{ number: string }>();
  const { me, loading: loadingMe, error: errorMe } = useGetMe();
  if (!number) {
    return <div>Case number is required</div>;
  }

  const { caseData, loading, error } = useGetCaseByCaseNumber(parseInt(number));
  if (loading || loadingMe) return <div>Loading...</div>;
  if (error || errorMe) return <div>Error loading case</div>;
  if (!caseData) return <div>No case found</div>;

  const c = caseData as ICase;

  // --- UI Consistency with CaseTable ---
  // Shared box style for case number, priority, status, type
  const caseBoxClasses =
    "inline-flex flex-col items-left gap-0 px-2.5 py-1 rounded text-xs font-semibold bg-white min-w-[70px] justify-center";

  const labelTextClass = "text-xs text-gray-400 italic mb-1";

  // Priority
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "text-green-600";
      case "HIGH":
        return "text-red-600";
      case "MEDIUM":
        return "text-yellow-600";
      default:
        return "text-gray-500";
    }
  };

  // Status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "OPEN":
        return { dotBgColor: "bg-green-500", textColor: "text-green-800" };
      case "CLOSED":
        return { dotBgColor: "bg-gray-400", textColor: "text-gray-500" };
      case "IN_PROGRESS":
        return { dotBgColor: "bg-yellow-500", textColor: "text-yellow-800" };
      default:
        return { dotBgColor: "bg-gray-400", textColor: "text-gray-500" };
    }
  };

  // Type badge
  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "PROBLEM":
        return "bg-red-100 text-btnRedHover";
      case "SUGGESTION":
        return "bg-green-100 text-btnGreenHover";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusStyle = getStatusStyle(c.status);
  const priorityStyle = getPriorityStyle(c.priority);
  const typeBadgeStyle = getTypeBadgeStyle(c.type);

  return (
    <div className="w-full mx-auto my-8 px-4">
      <div className="bg-white shadow rounded-lg p-6">
        {/* Content + Creator Row */}
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          {/* Creator at left */}
          <div className="flex flex-col items-center min-w-[120px]">
            {c.creator.avatar ? (
              <img
                src={c.creator.avatar}
                alt={c.creator.name}
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-300 mb-2"
              />
            ) : (
              <UserCircleIcon className="h-20 w-20 text-purple-400 mb-2" />
            )}
            <UserLink {...c.creator} key={c.creator._id} />
            <span className={labelTextClass}>{c.creator.position}</span>
          </div>
          {/* Content at right, aligned to bottom */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Case number as button-like box */}
                  <span
                    className={`${caseBoxClasses} bg-blue-100 text-blue-700 font-semibold`}
                    tabIndex={0}
                  >
                    <span className={labelTextClass}>{t("case_number")}</span>
                    <span className="flex items-center px-2 py-0.5">
                      {c.case_number}
                      <svg
                        className="ml-1 h-4 w-4 text-blue-400 group-hover:text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </span>
                  {/* Priority */}
                  <span className={`${caseBoxClasses} ${priorityStyle}`}>
                    <span className={labelTextClass}>{t("priority")}:</span>
                    <span className="flex items-center px-2 py-0.5">
                      <FlagIcon className="h-4 w-4 " /> {t(c.priority)}
                    </span>
                  </span>

                  {/* Type */}
                  <span className={`${caseBoxClasses} ${typeBadgeStyle}`}>
                    <span className={labelTextClass}>{t("type")}:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadgeStyle}`}
                    >
                      {t(c.type)}
                    </span>
                  </span>
                  {/* Status */}
                  <span className={`${caseBoxClasses}`}>
                    <span className={labelTextClass}>{t("status")}:</span>
                    <span className="flex items-center">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${statusStyle.dotBgColor}`}
                      />
                      <span className={`${statusStyle.textColor} px-1 py-0.5`}>
                        {t(c.status)}
                      </span>
                    </span>
                  </span>

                  {/* Categories */}
                  <span className={`${caseBoxClasses} flex-col bg-white`}>
                    <span className={labelTextClass}>{t("categories")}:</span>
                    <span className="flex flex-wrap gap-1">
                      {c.categories.length > 0 ? (
                        c.categories.map((cat: ICategory) => (
                          <CategoryLink key={cat._id} {...cat} />
                        ))
                      ) : (
                        <span className="text-gray-400 italic">
                          {t("no_categories")}
                        </span>
                      )}
                    </span>
                  </span>

                  {/* Rating */}
                  <span className={`${caseBoxClasses} flex-col bg-white`}>
                    <span className={labelTextClass}>{t("rating")}:</span>
                    <span className="flex flex-wrap gap-1">
                      <CaseRating ratings={c.rating} />
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShowDate date={c.date} />
                {/* History Button */}
                {c.history && c.history.length > 0 && (
                  <CaseHistoryModal history={c.history} />
                )}
                {/* Only show EditButton if current user is the creator */}
                {me &&
                  me.me &&
                  (me.me._id === c.creator._id ||
                    admin_check(me.me.role.name)) && <EditButton />}
                {console.log(admin_check(me.me.role.name))}
              </div>
            </div>
            {/* Content */}
            <div className="mt-auto flex-1 flex">
              <div className="max-h-48 bg-gray-50 rounded p-3 text-gray-900 whitespace-pre-line w-full flex overflow-y-auto">
                {c.content}
              </div>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {c.attachments && c.attachments.length > 0 && (
          <div className="mb-6">
            <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <PaperClipIcon className="h-5 w-5" /> {t("attachments")}:
            </div>
            <ul className="list-disc list-inside">
              {c.attachments.map((file: string, idx: number) => (
                <li key={idx}>
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    {file}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Comments */}
        {c.comments && c.comments.length > 0 && (
          <div className="mt-3">
            <hr className="my-2 border-gray-200" />
            <div className="flex flex-col gap-2">
              {c.comments.map((comment: IComment) => (
                <Comment key={comment._id} comment={comment} me={me?.me} />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Answers */}
      {c.answers && c.answers.length > 0 && (
        <ul className="space-y-2">
          {[
            // Approved answer first (if any), then others in original order
            ...c.answers.filter((a) => !!a.approved),
            ...c.answers.filter((a) => !a.approved),
          ].map((answer: IAnswer) => (
            <Answer key={answer._id} answer={answer} me={me?.me} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Case;
