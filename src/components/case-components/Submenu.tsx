// src/components/case-components/Submenu.tsx

import React, { useLayoutEffect, useState } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";
import { IAnswer, ICase, IComment, IMe, IUser } from "../../db/interfaces"; // Added IUser
import CaseHistoryContent from "./CaseHistoryContent";
import Comment from "./Comment";
import Answer from "./Answer";
import AddComment from "./AddComment";
import AddAnswer from "./AddAnswer";
import { USER_RIGHTS } from "../../utils/GLOBAL_PARAMETERS";
import CaseTasksTab from "./CaseTasksTab";

const LOCAL_STORAGE_KEY = "case-submenu-view";

// --- CHANGE START: Added mock users to provide data for tasks ---
const mockUsers: IUser[] = [
  { _id: "1", name: "Иван Петров", username: "ivan.petrov" },
  { _id: "2", name: "Мари Анеева", username: "mari.aneeva" },
  { _id: "3", name: "Петър Иванов", username: "petar.ivanov" },
];
// --- CHANGE END ---

interface SubmenuProps {
  caseData: ICase;
  t: (key: string, options?: Record<string, any>) => string;
  me: IMe;
  refetch: () => void;
  userRights: string[];
}

const Submenu: React.FC<SubmenuProps> = ({
  caseData,
  t,
  me,
  refetch,
  userRights,
}) => {
  const [view, setView] = useState<
    "answers" | "comments" | "history" | "tasks"
  >(() => {
    const stored = sessionStorage.getItem(LOCAL_STORAGE_KEY);
    if (
      stored === "answers" ||
      stored === "comments" ||
      stored === "history" ||
      stored === "tasks"
    ) {
      return stored;
    }
    return "answers";
  });

  const [tasksForCase, setTasksForCase] = useState<any[]>([]);

  // --- CHANGE START: Mock task data is now enriched with user info ---
  const mockTasksData = [
    {
      id: 1,
      title: "Актуализация на драйверите за принтери в офиса",
      status: "Процес",
      priority: "ВИСОК",
      creator: mockUsers[0],
      assignees: [mockUsers[1], mockUsers[2]],
      dueDate: "2025-08-15",
    },
    {
      id: 5,
      title: "Подмяна на дефектните офис столове",
      status: "Завършена",
      priority: "НИСЪК",
      creator: mockUsers[2],
      assignees: [mockUsers[0]],
      dueDate: "2025-08-10",
    },
  ];
  // --- CHANGE END ---

  const handleShowMockTasks = () => {
    setTasksForCase(mockTasksData);
  };

  useLayoutEffect(() => {
    sessionStorage.setItem(LOCAL_STORAGE_KEY, view);
  }, [view]);

  const isCreatorAndNothingElse =
    userRights.length === 1 && userRights.includes("creator");

  const hasApprovedAnswer = caseData.answers?.some((answer) => answer.approved);

  const submenu = [
    {
      key: "answers",
      label: (
        <>
          {t("answers")}
          <sup>{caseData?.answers?.length || 0}</sup>
        </>
      ),
      icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-2" />,
    },
    {
      key: "comments",
      label: (
        <>
          {t("comments")}
          <sup>{caseData?.comments?.length || 0}</sup>
        </>
      ),
      icon: <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 mr-2" />,
    },
    ...(hasApprovedAnswer
      ? [
          {
            key: "tasks",
            label: (
              <>
                Задачи
                <sup>{tasksForCase.length}</sup>
              </>
            ),
            icon: <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />,
          },
        ]
      : []),
    {
      key: "history",
      label: (
        <>
          {t("history")}
          <sup>{caseData?.history?.length || 0}</sup>
        </>
      ),
      icon: <ClockIcon className="h-5 w-5 mr-2" />,
    },
  ];

  if (isCreatorAndNothingElse) {
    submenu.splice(2, 2);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 sticky top-0 z-1 bg-white border-b border-gray-200">
        <div className="flex justify-center gap-2 py-4">
          {submenu.map((item) => (
            <button
              key={item.key}
              className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-150 border
                ${
                  view === item.key
                    ? "border-btnRedHover text-btnRedHover shadow"
                    : "border-gray-300 shadow-sm bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-btnRedHover hover:cursor-pointer"
                }`}
              type="button"
              onClick={() =>
                setView(
                  item.key as "answers" | "comments" | "history" | "tasks"
                )
              }
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pt-6">
        {view === "answers" && (
          <>
            {userRights.includes(USER_RIGHTS.EXPERT) ||
            userRights.includes(USER_RIGHTS.MANAGER) ||
            userRights.includes(USER_RIGHTS.ADMIN) ? (
              <AddAnswer
                caseNumber={caseData.case_number}
                caseId={caseData._id}
                t={t}
                me={me}
              />
            ) : null}
            {caseData.answers && caseData.answers.length > 0 ? (
              <>
                {[...caseData.answers]
                  .sort((a, b) => {
                    if (a.approved && !b.approved) return -1;
                    if (!a.approved && b.approved) return 1;
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return dateB - dateA;
                  })
                  .map((answer: IAnswer) => {
                    const showThisAnswer =
                      answer.approved ||
                      userRights.includes(USER_RIGHTS.EXPERT) ||
                      userRights.includes(USER_RIGHTS.MANAGER) ||
                      userRights.includes(USER_RIGHTS.ADMIN);
                    return showThisAnswer ? (
                      <Answer
                        key={answer._id}
                        answer={answer}
                        me={me}
                        refetch={refetch}
                        caseNumber={caseData.case_number}
                        status={caseData.status}
                        caseCategories={caseData.categories}
                      />
                    ) : null;
                  })}
              </>
            ) : (
              <div className="text-center text-gray-500">{t("no_answers")}</div>
            )}
          </>
        )}

        {view === "comments" && (
          <>
            <AddComment
              key="main-case-comment-box"
              caseId={caseData._id}
              t={t}
              me={me}
              caseNumber={caseData.case_number}
              inputId={`file-upload-comment-case-${caseData._id}`}
            />
            {caseData.comments && caseData.comments.length > 0 ? (
              <>
                {[...caseData.comments]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((comment: IComment) => (
                    <Comment
                      key={comment._id}
                      comment={comment}
                      me={me}
                      caseNumber={caseData.case_number}
                    />
                  ))}
              </>
            ) : (
              <div className="text-center text-gray-500">
                {t("no_comments")}
              </div>
            )}
          </>
        )}

        {view === "tasks" && (
          <CaseTasksTab
            caseData={caseData}
            tasks={tasksForCase}
            onShowMockTasks={handleShowMockTasks}
          />
        )}

        {view === "history" &&
          (caseData.history && caseData.history.length > 0 ? (
            <div className="flex flex-col gap-4 mb-8 ml-4">
              <CaseHistoryContent history={caseData.history} />
            </div>
          ) : (
            <div className="text-center text-gray-500">{t("no_history")}</div>
          ))}
      </div>
    </div>
  );
};

export default Submenu;
