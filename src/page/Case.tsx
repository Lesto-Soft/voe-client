import { useGetCaseByCaseNumber } from "../graphql/hooks/case";
import { useParams } from "react-router";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import { FlagIcon } from "@heroicons/react/24/solid";
import { ICase, ICategory, IComment, IAnswer } from "../db/interfaces";
import { useTranslation } from "react-i18next";
import CaseHistoryModal from "../components/modals/HistoryModal";
import Answer from "../components/case-components/Answer";
import Comment from "../components/case-components/Comment";
import CategoryLink from "../components/global/CategoryLink";
import ShowDate from "../components/global/ShowDate";
import EditButton from "../components/global/EditButton";
import { useGetMe } from "../graphql/hooks/user";
import { admin_check } from "../utils/rowStringCheckers";
import {
  getPriorityStyle,
  getStatusStyle,
  getTypeBadgeStyle,
} from "../utils/style-helpers";
import Creator from "../components/case-components/Creator";
import { labelTextClass, caseBoxClasses } from "../ui/reusable-styles";
import CaseRating from "../components/case-components/Rating";

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

  const statusStyle = getStatusStyle(c.status);
  const priorityStyle = getPriorityStyle(c.priority);
  const typeBadgeStyle = getTypeBadgeStyle(c.type);

  return (
    <>
      <div className="w-full mx-auto my-8 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          {/* Content + Creator Row */}
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <Creator creator={c.creator} />

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
                        <span
                          className={`${statusStyle.textColor} px-1 py-0.5`}
                        >
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
                </div>
              </div>
              {/* Content */}
              <div className="mt-1 flex-1 flex">
                <div className=" bg-gray-50 rounded p-3 text-gray-900 whitespace-pre-line w-full flex overflow-y-auto break-all">
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
    </>
  );
};

export default Case;
