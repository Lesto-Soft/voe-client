import React from "react";
import { Link } from "react-router";
import { ICase } from "../../db/interfaces";
interface ICaseLinkProps {
  my_case: ICase;
  t: (key: string) => string;
}

const CaseLink: React.FC<ICaseLinkProps> = ({ my_case, t }) => {
  const isClosed = my_case.status === "CLOSED";

  return (
    <Link
      to={`/case/${my_case.case_number}`}
      className={`inline-flex items-center justify-center w-full px-2 py-1 rounded-md transition-colors duration-150 border border-blue-200 shadow-sm
      ${
        isClosed
          ? "bg-blue-50 text-blue-400 "
          : "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer"
      }`}
      title={`${t("details_for")} ${my_case.case_number}`}
      tabIndex={0}
    >
      <span className="font-semibold">{my_case.case_number}</span>
      {/* Optionally, add an icon for clarity */}
      <svg
        className="ml-1 h-4 w-4 text-blue-400 group-hover:text-blue-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
};

export default CaseLink;
