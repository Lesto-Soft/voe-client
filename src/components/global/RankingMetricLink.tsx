// src/components/global/RatingMetricLink.tsx
import React from "react";
import { Link } from "react-router";
import { IMe, IRatingMetric } from "../../db/interfaces";
import { useCurrentUser } from "../../context/UserContext";
import { canViewRatingMetric } from "../../utils/rightUtils";

// Helper to define the badge's appearance
const getMetricBadgeClasses = () =>
  `inline-flex items-center justify-center max-w-full px-2 py-0.5 rounded-md text-xs font-bold transition-colors duration-150 ease-in-out text-left bg-yellow-100 text-yellow-800 border border-yellow-200`;

interface RatingMetricLinkProps {
  metric: IRatingMetric;
}

const RatingMetricLink: React.FC<RatingMetricLinkProps> = ({ metric }) => {
  const currentUser = useCurrentUser() as IMe;

  if (!metric || !currentUser) return null;

  // Check if the current user has permission to view the page
  const isAllowed = canViewRatingMetric(currentUser);

  const baseClasses = getMetricBadgeClasses();
  const hoverClasses = "hover:bg-yellow-200 hover:cursor-pointer";
  const disabledClasses = "opacity-70 cursor-not-allowed";
  const title = isAllowed
    ? `View details for ${metric.name}`
    : "Нямате права за достъп";

  const linkContent = <span className="truncate">{metric.name}</span>;

  if (isAllowed) {
    return (
      <Link
        to={`/rating-metric/${metric._id}`} // Route for the new page
        className={`${baseClasses} ${hoverClasses}`}
        title={title}
      >
        {linkContent}
      </Link>
    );
  }

  // Render a non-clickable span if not allowed
  return (
    <span className={`${baseClasses} ${disabledClasses}`} title={title}>
      {linkContent}
    </span>
  );
};

export default RatingMetricLink;
