// src/components/global/UserLink.tsx
import { Link } from "react-router";
import { IUser } from "../../db/interfaces";

const getInitials = (name: string = ""): string =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const getFirstName = (name: string = ""): string => name.split(" ")[0];

const getCreatorBadgeClasses = () =>
  // REMOVED fixed widths, ADDED inline-flex for self-sizing
  `inline-flex items-center justify-center max-w-full px-2 py-0.5 rounded-md text-xs font-bold transition-colors duration-150 ease-in-out text-left hover:cursor-pointer bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200`;

const UserLink: React.FC<{ user: IUser }> = ({ user }) => {
  // The 'type' prop is removed as this single component is now flexible enough for all use cases.
  // The parent container (e.g., a table cell) should control the width.

  if (!user) return null;

  return (
    <Link
      to={`/user/${user.username}`}
      className={getCreatorBadgeClasses()}
      title={user.name}
    >
      {/* Default (smallest screens): Show only initials */}
      <span className="block sm:hidden">{getInitials(user.name)}</span>

      {/* Small screens (sm) and up: Show first name, truncated if needed */}
      <span className="hidden sm:block lg:hidden truncate">
        {getFirstName(user.name)}
      </span>

      {/* Large screens (lg) and up: Show full name, truncated if needed */}
      <span className="hidden lg:block truncate">{user.name}</span>
    </Link>
  );
};

export default UserLink;
