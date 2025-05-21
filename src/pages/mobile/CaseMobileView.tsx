import React, { useState } from "react";
import { IAnswer, ICase, IComment } from "../../db/interfaces";
import CaseInfoMobile from "../../components/case-components/mobile/CaseInfoMobile";
import CaseHistoryContent from "../../components/case-components/CaseHistoryContent";
import Submenu from "../../components/case-components/Submenu";
import Comment from "../../components/case-components/Comment";
import AnswerMobile from "../../components/case-components/mobile/AnswerMobile";

interface ICaseMobileViewProps {
  c: ICase;
  refetch: () => void;
  me: any;
  t: (key: string) => string;
}

const CaseMobileView: React.FC<ICaseMobileViewProps> = ({
  c,
  me,
  refetch,
  t,
}) => {
  return (
    <div>
      <CaseInfoMobile
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

      <Submenu caseData={c} t={t} me={me} refetch={refetch} />
    </div>
  );
};

export default CaseMobileView;
