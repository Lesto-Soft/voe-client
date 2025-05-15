import React from "react";
import { IUser } from "../../db/interfaces";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import UserLink from "../global/UserLink";
import { labelTextClass } from "../../ui/reusable-styles";

const Creator: React.FC<{ creator: IUser }> = ({ creator }) => {
  return (
    <div className="flex flex-col items-center w-42 ">
      {creator.avatar ? (
        <img
          src={creator.avatar}
          alt={creator.name}
          className="h-20 w-20 rounded-full object-cover border-2 border-gray-300 mb-2"
        />
      ) : (
        <UserCircleIcon className="h-20 w-20 text-purple-400 mb-2" />
      )}
      <UserLink user={creator} type="case" />
      <span className={labelTextClass}>{creator.position}</span>
    </div>
  );
};

export default Creator;
