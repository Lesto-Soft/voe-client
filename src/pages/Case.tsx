import { useGetCaseByCaseNumber } from "../graphql/hooks/case";
import { useParams } from "react-router";
import { ICase } from "../db/interfaces";
import { useTranslation } from "react-i18next";
import { useGetMe } from "../graphql/hooks/user";
import CaseInfo from "../components/case-components/CaseInfo";
import CaseMobileView from "./mobile/CaseMobileView";
import Submenu from "../components/case-components/Submenu";

const Case = () => {
  const { t } = useTranslation("dashboard");
  const { number } = useParams<{ number: string }>();
  const { me, loading: loadingMe, error: errorMe } = useGetMe();

  if (!number) {
    return <div>Case number is required</div>;
  }

  const { caseData, loading, error, refetch } = useGetCaseByCaseNumber(
    number ? parseInt(number) : 0
  );

  if (!number) {
    return <div>Case number is required</div>;
  }

  if (loading || loadingMe) return <div>Loading...</div>;
  if (error || errorMe) return <div>Error loading case</div>;
  if (!caseData) return <div>No case found</div>;

  const c = caseData as ICase;

  return (
    <>
      <div
        className=" flex-row bg-gray-50 hidden lg:flex"
        style={{ minHeight: "calc(100vh - 6rem)" }}
      >
        {/* CaseInfo is static, not sticky, not scrollable */}
        <CaseInfo
          content={c.content}
          case_number={c.case_number}
          caseId={c._id}
          type={c.type}
          priority={c.priority}
          status={c.status}
          categories={c.categories}
          creator={c.creator}
          rating={c.rating}
          date={c.date}
          me={me.me}
          refetch={refetch}
        />
        {/* Only this right side is scrollable */}
        <div
          className="flex-1 overflow-y-auto  py-8 "
          style={{ maxHeight: "calc(100vh - 6rem)" }}
        >
          <Submenu caseData={c} t={t} me={me.me} refetch={refetch} />
        </div>
      </div>
      <div className="lg:hidden block ">
        <CaseMobileView c={c} me={me.me} refetch={refetch} t={t} />
      </div>
    </>
  );
};

export default Case;
