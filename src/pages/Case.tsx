// src/pages/Case.tsx (or wherever your Case component is)
import { useGetCaseByCaseNumber } from "../graphql/hooks/case";
import { useParams } from "react-router";
// ICase is an interface, not a component for import if it's just types
// import { ICase } from "../db/interfaces";
import { useTranslation } from "react-i18next";
import CaseInfo from "../components/case-components/CaseInfo"; // Unified CaseInfo
// No CaseInfoMobile import needed
import Submenu from "../components/case-components/Submenu";
import { ICase } from "../db/interfaces"; // Ensure ICase type is imported
import { useCurrentUser } from "../context/UserContext";
import { determineUserRightsForCase } from "../utils/rightUtils";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";

const Case = () => {
  const { t } = useTranslation("dashboard");
  const { number: numberParam } = useParams<{ number: string }>();
  const currentUser = useCurrentUser();

  let numericCaseNumber: number | undefined = undefined;
  if (numberParam) {
    const parsed = parseInt(numberParam, 10);
    if (!isNaN(parsed) && parsed > 0) {
      numericCaseNumber = parsed;
    }
  }

  const {
    caseData,
    loading: loadingCase,
    error: errorCase,
    refetch,
  } = useGetCaseByCaseNumber(numericCaseNumber ?? 0, currentUser.role?._id);

  if (!numberParam) {
    return <div>Case number is missing in the URL.</div>;
  }
  if (!numericCaseNumber) {
    return (
      <div>
        Invalid case number provided: "{numberParam}". Please check the URL.
      </div>
    );
  }

  if (loadingCase) {
    return <div>Loading case data...</div>;
  }

  if (errorCase) {
    console.error(`Error loading case ${numericCaseNumber}:`, errorCase);
    return (
      <div>
        Error loading case data for case "{numericCaseNumber}". Please try again
        later.
      </div>
    );
  }

  if (!caseData) {
    return <div>No case found for case number "{numericCaseNumber}".</div>;
  }

  const c = caseData as ICase;
  const userRights = determineUserRightsForCase(currentUser, c);

  if (
    !userRights ||
    (userRights.length === 0 && currentUser.role?._id !== ROLES.ADMIN)
  ) {
    return (
      <div>You do not have the necessary permissions to view this case.</div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50">
      {/* Wrapper for the Unified ResponsiveCaseInfo */}
      <div
        className={`
          w-full lg:w-96 lg:shrink-0 
          lg:sticky lg:top-[6rem] 
          order-1 lg:order-none 
          lg:h-[calc(100vh-6rem)]
          mb-4 lg:mb-0 lg:mr-4 
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

      <div
        className="flex-1 w-full lg:w-auto 
                   lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)] /* Scrollable area for Submenu on desktop */
                   order-2 lg:order-none
                   p-4 sm:p-6 lg:p-0 /* Add padding for mobile/tablet, remove for desktop if submenu wrapper has it */
                  "
      >
        <div className="lg:py-8">
          <Submenu
            caseData={c}
            t={t}
            me={currentUser}
            refetch={refetch}
            userRights={userRights}
          />
        </div>
      </div>
    </div>
  );
};

export default Case;
