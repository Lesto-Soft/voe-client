// src/pages/Case.tsx
import {
  useGetCaseByCaseNumber,
  useMarkCaseAsRead,
  useUpdateCase,
} from "../graphql/hooks/case";
import { useGetActiveCategories } from "../graphql/hooks/category";
import { useMentionTiers } from "../hooks/useMentionTiers";
import { MentionGuestContext } from "../context/MentionGuestContext";
import { useLocation, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import CaseInfo from "../components/case-components/CaseInfo";
import Submenu from "../components/case-components/Submenu";
import { ICase, ICategory, IUser } from "../db/interfaces";
import { useCurrentUser } from "../context/UserContext";
import { determineUserRightsForCase } from "../utils/rightUtils";
import {
  ROLES,
  EXAMPLE_CASE_NUMBER,
  USER_RIGHTS,
  MAX_CASE_CATEGORIES,
} from "../utils/GLOBAL_PARAMETERS";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { UnsavedChangesProvider } from "../context/UnsavedChangesContext";
import { useNotificationSubscription } from "../graphql/hooks/notificationHook";

// Authorization
import { useAuthorization } from "../hooks/useAuthorization";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import useDocumentTitle from "../hooks/useDocumentTitle";

const Case = () => {
  const { number: numberParam } = useParams<{ number: string }>();
  const numericCaseNumber = numberParam ? parseInt(numberParam, 10) : NaN;

  if (!numberParam || isNaN(numericCaseNumber) || numericCaseNumber < 0) {
    return (
      <PageStatusDisplay
        notFound
        message={`Номерът на сигнала "${
          numberParam || ""
        }" липсва или е невалиден.`}
      />
    );
  }

  // the number is validated here so every hook below runs unconditionally
  return (
    <CaseContent key={numericCaseNumber} numericCaseNumber={numericCaseNumber} />
  );
};

const CaseContent = ({ numericCaseNumber }: { numericCaseNumber: number }) => {
  const { t } = useTranslation("dashboard");
  const location = useLocation();
  const currentUser = useCurrentUser();
  useDocumentTitle(`Сигнал #${numericCaseNumber}`);

  const {
    caseData,
    loading: loadingCase,
    error: errorCase,
    refetch,
  } = useGetCaseByCaseNumber(numericCaseNumber, currentUser.role?._id);

  const { markCaseAsRead } = useMarkCaseAsRead(numericCaseNumber);

  const { updateCase } = useUpdateCase(numericCaseNumber);
  const { categories: activeCategories } = useGetActiveCategories();
  const caseCategoryIds = useMemo(
    () => (caseData?.categories || []).map((cat: ICategory) => cat._id),
    [caseData?.categories],
  );
  const guestIds = useMemo(
    () => (caseData?.guests || []).map((guest: IUser) => guest._id),
    [caseData?.guests],
  );
  const mentions = useMentionTiers({
    categoryIds: caseCategoryIds,
    categories: activeCategories,
    creatorId: caseData?.creator?._id,
    guestIds,
  });

  useEffect(() => {
    if (location.state?.refetch) {
      refetch();
      // Clean the state to prevent re-fetching on browser back/forward navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);

  // Record the open on every visit (refreshes lastReadAt server-side);
  // the ref guard keeps it to once per case load instead of every refetch
  const markedCaseIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (caseData && currentUser && markedCaseIdRef.current !== caseData._id) {
      markedCaseIdRef.current = caseData._id;
      markCaseAsRead(caseData._id);
    }
  }, [caseData, currentUser, markCaseAsRead]);

  const { isAllowed, isLoading: authLoading } = useAuthorization({
    type: "case",
    data: caseData,
  });

  // Real-time: silently refetch case data when a notification arrives for this case.
  // No navigation or tab switching — the user stays where they are undisturbed.
  // Highlighting only happens when the user clicks a notification from the bell icon.
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const handleNotification = useCallback(
    ({ data }: any) => {
      const notification = data.data?.notificationAdded;
      if (!notification || notification.caseNumber !== numericCaseNumber) return;
      refetchRef.current();
    },
    [numericCaseNumber],
  );

  useNotificationSubscription({
    variables: { userId: currentUser._id },
    onData: handleNotification,
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

  const isExampleCase = c.case_number === EXAMPLE_CASE_NUMBER;
  if (
    !isExampleCase &&
    (!userRights ||
      (userRights.length === 0 && currentUser.role?._id !== ROLES.ADMIN))
  ) {
    return (
      <div>You do not have the necessary permissions to view this case.</div>
    );
  }

  // Managers/admins may add the mentioned user's category instead of granting
  // guest access; the forms cap a case at MAX_CASE_CATEGORIES categories
  const canAddCategory =
    (userRights.includes(USER_RIGHTS.MANAGER) ||
      userRights.includes(USER_RIGHTS.ADMIN)) &&
    c.categories.length < MAX_CASE_CATEGORIES;
  const mentionGuestOptions = {
    addCategoryLabel: "Добави категория",
    emptyHint: "Търсят се всички служители по име и потребителско име.",
    onAddCategory: canAddCategory
      ? async (categoryId: string) => {
          await updateCase(c._id, currentUser._id, {
            content: c.content,
            type: c.type as "PROBLEM" | "SUGGESTION",
            priority: c.priority as "LOW" | "MEDIUM" | "HIGH",
            categories: [...caseCategoryIds, categoryId],
          });
        }
      : undefined,
  };
  return (
    <UnsavedChangesProvider>
      <MentionGuestContext.Provider value={mentionGuestOptions}>
        {isExampleCase && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 text-center text-sm text-blue-800">
            Това е примерен сигнал, създаден за демонстрационни цели. Съдържанието му не е реално.
          </div>
        )}
        <div className={`flex flex-col lg:flex-row bg-gray-50 w-full ${isExampleCase ? "lg:h-[calc(100vh-6rem-44px)]" : "lg:h-[calc(100vh-6rem)]"}`}>
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
              guests={c.guests}
              history={c.history}
            />
          </div>

          <div className="w-full lg:flex-1 lg:w-auto order-2 lg:order-none lg:h-full">
            <Submenu
              caseData={c}
              t={t}
              me={currentUser}
              refetch={refetch}
              userRights={userRights}
              mentions={mentions}
            />
          </div>
        </div>
      </MentionGuestContext.Provider>
    </UnsavedChangesProvider>
  );
};

export default Case;
