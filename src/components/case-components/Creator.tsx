import React from "react";
import { IUser } from "../../db/interfaces";
import UserAvatar from "../cards/UserAvatar";
import UserLink from "../global/UserLink";
import { labelTextClass } from "../../ui/reusable-styles";

interface CreatorProps {
  creator: IUser;
  enableAvatarPreview?: boolean; // Optional prop to enable preview
}

const Creator: React.FC<CreatorProps> = ({
  creator,
  enableAvatarPreview = true, // Default to true for better UX
}) => {
  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  return (
    <div className="flex flex-col items-center w-42">
      <UserAvatar
        name={creator.name}
        imageUrl={
          creator.avatar
            ? `${serverBaseUrl}/static/avatars/${creator._id}/${creator.avatar}`
            : null
        }
        size={80} // Matches the original h-20 w-20 (80px)
        enablePreview={enableAvatarPreview}
      />
      <div className="mt-2 text-center">
        <UserLink user={creator} />
        {creator.position && (
          <span className={`${labelTextClass} block mt-1`}>
            {creator.position}
          </span>
        )}
      </div>
    </div>
  );
};

export default Creator;
