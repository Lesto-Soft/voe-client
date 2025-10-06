import React from "react";
import { Link } from "react-router";
import { ICase } from "../../../db/interfaces";
import { useCurrentUser } from "../../../context/UserContext";
import { canViewCase } from "../../../utils/rightUtils";

interface ICaseLinkProps {
  my_case: ICase;
  t: (key: string) => string;
  targetId?: string; // 1. Add optional targetId prop
}

const CaseLink: React.FC<ICaseLinkProps> = ({ my_case, t, targetId }) => {
  // 2. Destructure prop
  const currentUser = useCurrentUser();

  if (!my_case || !currentUser) {
    return null;
  }

  const isUnread = !my_case.readBy?.some(
    (entry) => entry.user._id === currentUser._id
  );

  const isAllowed = canViewCase(currentUser, my_case);
  const isClosed = my_case.status === "CLOSED";

  const baseClasses =
    "relative inline-flex items-center justify-center w-full px-2 py-1 rounded-md transition-colors duration-150 border shadow-sm";

  const disabledClasses = "opacity-60 cursor-not-allowed";
  const title = isAllowed
    ? `${t("details_for")} ${my_case.case_number}`
    : "Нямате права за достъп до този сигнал";

  const unreadAccentClasses = isUnread
    ? `before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-md ${
        isClosed ? "before:bg-blue-300" : "before:bg-blue-500"
      }`
    : "";

  const linkContent = (
    <>
      <span className="font-bold">{my_case.case_number}</span>
      <svg
        className="ml-1 h-4 w-4 text-blue-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </>
  );

  if (isAllowed) {
    const activeClasses = isClosed
      ? "bg-blue-50 text-blue-400 border-blue-200"
      : isUnread
      ? "bg-blue-100 text-blue-800 font-bold hover:bg-blue-200 border-blue-300"
      : "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 cursor-pointer border-blue-200";

    // 3. Construct the path with the optional hash
    const path = `/case/${my_case.case_number}${
      targetId ? `#${targetId}` : ""
    }`;

    return (
      <Link
        to={path} // 4. Use the new path variable
        className={`${baseClasses} ${activeClasses} ${unreadAccentClasses}`}
        title={title}
        tabIndex={0}
      >
        {linkContent}
      </Link>
    );
  } else {
    const finalDisabledClasses = `${baseClasses} bg-blue-50 text-blue-400 border-blue-200 ${disabledClasses}`;
    return (
      <span className={finalDisabledClasses} title={title}>
        {linkContent}
      </span>
    );
  }
};

export default CaseLink;
