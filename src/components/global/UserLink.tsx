import { Link } from "react-router";
import { IUser } from "../../db/interfaces";

const types = {
  case: "w-40",
  table: "md:w-40 max-w-40",
};
const getCreatorBadgeClasses = (type: string) =>
  `${type} inline-block px-2 py-0.5 rounded-md text-xs font-medium transition-colors duration-150 ease-in-out text-left hover:cursor-pointer bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200`;

const UserLink: React.FC<{ user: IUser; type: keyof typeof types }> = ({
  user,
  type,
}) => {
  return (
    <Link
      // TODO to={`/user/${user.username}`}
      to={`/user/${user._id}`}
      className={getCreatorBadgeClasses(types[type])}
    >
      {type === "table" && (
        <span className="md:hidden text-center w-full block">
          {user.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()}
        </span>
      )}
      <p
        className={`${
          type === "table" ? "hidden md:block" : ""
        }  text-center w-full break-words whitespace-pre-line`}
        title={user.name}
      >
        {user.name}
      </p>
    </Link>
  );
};

export default UserLink;
