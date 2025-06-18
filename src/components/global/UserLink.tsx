// src/components/global/UserLink.tsx
import { Link } from "react-router";
import { IMe, IUser } from "../../db/interfaces";
import { canViewUserProfile } from "../../utils/rightUtils";
import { useCurrentUser } from "../../context/UserContext"; // 1. Import the hook

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
}

const UserLink: React.FC<UserLinkProps> = ({ user }) => {
  // 3. Get the current user directly from the context
  const currentUser = useCurrentUser();

  if (!user || !currentUser) return null;

  const isAllowed = canViewUserProfile(currentUser, user);

  const baseClasses = getCreatorBadgeClasses();
  const disabledClasses = "opacity-60 cursor-not-allowed";
  const title = isAllowed ? user.name : "Нямате права за достъп до този профил";

  const linkContent = (
    <>
      <span className="block sm:hidden">{getInitials(user.name)}</span>
      <span className="hidden sm:block lg:hidden truncate">
        {getFirstName(user.name)}
      </span>
      <span className="hidden lg:block truncate">{user.name}</span>
    </>
  );

  if (isAllowed) {
    return (
      <Link
        to={`/user/${user.username}`}
        className={`${baseClasses} hover:bg-purple-200 hover:cursor-pointer`}
        title={title}
      >
        {linkContent}
      </Link>
    );
  }

  return (
    <span className={`${baseClasses} ${disabledClasses}`} title={title}>
      {linkContent}
    </span>
  );
};

export default UserLink;
