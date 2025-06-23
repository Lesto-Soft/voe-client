// src/pages/Case.tsx
import { useGetCaseByCaseNumber } from "../graphql/hooks/case";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import CaseInfo from "../components/case-components/CaseInfo";
import Submenu from "../components/case-components/Submenu";
import { ICase } from "../db/interfaces";
import { useCurrentUser } from "../context/UserContext";
import { determineUserRightsForCase } from "../utils/rightUtils";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";

// Authorization
import { useAuthorization } from "../hooks/useAuthorization";
import ForbiddenPage from "./ForbiddenPage";
import PageStatusDisplay from "../components/global/PageStatusDisplay";

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

  const { isAllowed, isLoading: authLoading } = useAuthorization({
    type: "case",
    data: caseData,
  });

  if (loadingCase || authLoading) {
    return <PageStatusDisplay loading message="Зареждане на сигнал..." />;
  }

  if (errorCase) {
    return <PageStatusDisplay error={errorCase} />;
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

  return (
    // --- MODIFIED: This container now defines the overall height for the two columns on desktop ---
    <div className="flex flex-col lg:flex-row bg-gray-50 lg:h-[calc(100vh-6rem)]">
      {/* Left Panel for CaseInfo: This remains sticky and its own content can scroll if needed */}
      <div
        className={`
          w-full lg:w-96 lg:shrink-0 
          lg:sticky lg:top-[6rem] 
          order-1 lg:order-none 
          lg:h-full
          lg:mb-0
          z-2
        `}
      >
        <CaseInfo
          content={c.content}
          caseId={c._id}
          type={c.type}
          priority={c.priority}
          status={c.status}
          categories={c.categories}
          creator={c.creator}
          rating={c.rating}
          date={c.date}
          me={currentUser}
          refetch={refetch}
          attachments={c.attachments}
          caseNumber={c.case_number}
          rights={userRights}
        />
      </div>

      {/* --- MODIFIED: Right Panel for Submenu ---
          This container now has a fixed height and does NOT scroll.
          This allows the Submenu component inside to handle its own scrolling.
      */}
      <div className="flex-1 w-full lg:w-auto order-2 lg:order-none lg:h-full">
        <Submenu
          caseData={c}
          t={t}
          me={currentUser}
          refetch={refetch}
          userRights={userRights}
        />
      </div>
    </div>
  );
};

export default Case;
