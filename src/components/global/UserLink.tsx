import { Link } from "react-router";
import { IUser } from "../../db/interfaces";

const getCreatorBadgeClasses =
  "inline-block px-2 py-0.5 rounded-md text-xs font-medium transition-colors duration-150 ease-in-out text-left hover:cursor-pointer bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200";
const UserLink = (user: IUser) => {
  return (
    <Link to={`/user/${user._id}`} className={getCreatorBadgeClasses + ""}>
      <span className="md:hidden">
        {user.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()}
      </span>
      <span className="hidden md:inline">{user.name}</span>
    </Link>
  );
};

export default UserLink;
