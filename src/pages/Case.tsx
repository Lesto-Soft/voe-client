// src/pages/Case.tsx
import {
  useGetCaseByCaseNumber,
  useMarkCaseAsRead,
} from "../graphql/hooks/case";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import CaseInfo from "../components/case-components/CaseInfo";
import Submenu from "../components/case-components/Submenu";
import { ICase, ICategory, IReadBy, IUser } from "../db/interfaces";
import { useCurrentUser } from "../context/UserContext";
import { determineUserRightsForCase } from "../utils/rightUtils";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";
import { useEffect } from "react"; // ADDED

// Authorization
import { useAuthorization } from "../hooks/useAuthorization";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";
import PageStatusDisplay from "../components/global/PageStatusDisplay";

function getUniqueMentionableUsers(
  categories: ICategory[],
  creator: IUser
): {
  name: string;
  username: string;
  _id: string;
}[] {
  const uniqueUsersMap = new Map<
    string,
    { name: string; username: string; _id: string }
  >();
  if (creator && creator._id) {
    uniqueUsersMap.set(creator._id, {
      _id: creator._id,
      name: creator.name,
      username: creator.username,
    });
  }
  const allUsers = categories.flatMap((cat) => [
    ...(cat.experts || []),
    ...(cat.managers || []),
  ]);

  for (const user of allUsers) {
    if (user && user._id && !uniqueUsersMap.has(user._id)) {
      uniqueUsersMap.set(user._id, {
        _id: user._id,
        name: user.name,
        username: user.username,
      });
    }
  }

  return Array.from(uniqueUsersMap.values());
}

const Case = () => {
  const { t } = useTranslation("dashboard");
  const { number: numberParam } = useParams<{ number: string }>();
  const currentUser = useCurrentUser();

  if (
    !numberParam ||
    isNaN(parseInt(numberParam, 10)) ||
    parseInt(numberParam, 10) <= 0
  ) {
    return (
      <PageStatusDisplay
        notFound
        message={`Номерът на сигнала "${
          numberParam || ""
        }" липсва или е невалиден.`}
      />
    );
  }
  const numericCaseNumber = parseInt(numberParam, 10);

  const {
    caseData,
    loading: loadingCase,
    error: errorCase,
    refetch,
  } = useGetCaseByCaseNumber(numericCaseNumber, currentUser.role?._id);

  const { markCaseAsRead } = useMarkCaseAsRead(numericCaseNumber);

  useEffect(() => {
    if (caseData && currentUser) {
      const hasRead = caseData.readBy?.some(
        (entry: IReadBy) => entry.user._id === currentUser._id
      );

      if (!hasRead) {
        markCaseAsRead(caseData._id);
      }
    }
  }, [caseData, currentUser, markCaseAsRead]);

  const { isAllowed, isLoading: authLoading } = useAuthorization({
    type: "case",
    data: caseData,
  });

  if (errorCase) {
    return <PageStatusDisplay error={errorCase} />;
  }

  if (loadingCase || authLoading) {
    return <PageStatusDisplay loading message="Зареждане на сигнал..." />;
  }

  if (!caseData) {
    return (
      <PageStatusDisplay
        notFound
        message={`Не беше намерен сигнал с номер: "${numericCaseNumber}".`}
      />
    );
  }

  if (!isAllowed) {
    return <ForbiddenPage />;
  }

  const c = caseData as ICase;
  const userRights = determineUserRightsForCase(currentUser, caseData as ICase);

  if (
    !userRights ||
    (userRights.length === 0 && currentUser.role?._id !== ROLES.ADMIN)
  ) {
    return (
      <div>You do not have the necessary permissions to view this case.</div>
    );
  }

  const expert_managers = getUniqueMentionableUsers(c.categories, c.creator);
  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 lg:h-[calc(100vh-6rem)] w-full">
      <div
        className={
          "max-w-full lg:w-96 lg:shrink-0 lg:sticky lg:top-[6rem] order-1 lg:order-none lg:h-full lg:mb-0 z-2"
        }
      >
        <CaseInfo
          content={c.content}
          caseId={c._id}
          type={c.type}
          priority={c.priority}
          status={c.status as string}
          categories={c.categories}
          creator={c.creator}
          metricScores={c.metricScores}
          calculatedRating={c.calculatedRating}
          date={c.date}
          me={currentUser}
          refetch={refetch}
          attachments={c.attachments}
          caseNumber={c.case_number}
          isLoading={loadingCase}
          error={errorCase}
          rights={userRights}
          readBy={c.readBy}
        />
      </div>

      <div className="flex-1 w-full lg:w-auto order-2 lg:order-none lg:h-full">
        <Submenu
          caseData={c}
          t={t}
          me={currentUser}
          refetch={refetch}
          userRights={userRights}
          mentions={expert_managers}
        />
      </div>
    </div>
  );
};

export default Case;
