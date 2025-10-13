// src/components/global/links/UserLink.tsx
import { Link } from "react-router";
import { IUser } from "../../../db/interfaces";
import { canViewUserProfile } from "../../../utils/rightUtils";
import { useCurrentUser } from "../../../context/UserContext"; // 1. Import the hook

// Helper functions remain the same
const getInitials = (name: string = ""): string =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
const getFirstName = (name: string = ""): string => name.split(" ")[0];

const getCreatorBadgeClasses = () =>
  `inline-flex items-center justify-center max-w-full px-2 py-0.5 rounded-md text-xs font-bold transition-colors duration-150 ease-in-out text-left bg-purple-100 text-purple-800 border border-purple-200`;

// 2. Remove currentUser from the props interface
interface UserLinkProps {
  user: IUser;
  initialsOnlyMobile?: boolean;
}

const UserLink: React.FC<UserLinkProps> = ({
  user,
  initialsOnlyMobile = false,
}) => {
  // 3. Get the current user directly from the context
  const currentUser = useCurrentUser();

  if (!user || !currentUser) return null;

  const isAllowed = canViewUserProfile(currentUser, user);

  const baseClasses = getCreatorBadgeClasses();
  const disabledClasses = "opacity-60 cursor-not-allowed";
  const title = isAllowed ? user.name : "Нямате права за достъп до този профил";

  const linkInitials = (
    <span className="truncate">
      <span className="sm:hidden">{getInitials(user.name)}</span>
      <span className="hidden sm:inline lg:hidden">
        {getFirstName(user.name)}
      </span>
      <span className="hidden lg:inline">{user.name}</span>
    </span>
  );

  const linkSimpleContent = (
    <span className="truncate">
      <span className="lg:hidden">{getFirstName(user.name)}</span>
      <span className="hidden lg:inline">{user.name}</span>
    </span>
  );

  if (isAllowed) {
    return (
      <Link
        to={`/user/${user.username}`}
        className={`${baseClasses} hover:bg-purple-200 hover:cursor-pointer`}
        title={title}
      >
        {initialsOnlyMobile ? linkInitials : linkSimpleContent}
      </Link>
    );
  }

  return (
    <span className={`${baseClasses} ${disabledClasses}`} title={title}>
      {initialsOnlyMobile ? linkInitials : linkSimpleContent}
    </span>
  );
};

export default UserLink;
