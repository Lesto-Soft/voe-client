import { IComment } from "../../../db/interfaces";
import UserLink from "../../global/UserLink";
import ShowDate from "../../global/ShowDate";
import EditButton from "../../global/EditButton";
import { admin_check } from "../../../utils/rowStringCheckers";

interface CommentProps {
  comment: IComment;
  me?: any;
}

const CommentMobile: React.FC<CommentProps> = ({ comment, me }) => {
  return (
    <div className="flex flex-row items-stretch gap-3 rounded p-3">
      {/* Left: Creator info, vertically centered */}
      <div className="flex flex-col justify-center items-center">
        <UserLink user={comment.creator} type="case" />
        {comment.creator.position && (
          <span className="text-xs text-gray-400 italic mt-1 text-center w-full block">
            {comment.creator.position}
          </span>
        )}
        <div className="ap-2 mb-1 flex flex-col justify-center items-center">
          <ShowDate date={comment.date} />
          {me &&
            me.role &&
            (me._id === comment.creator._id || admin_check(me.role.name)) && (
              <EditButton />
            )}
        </div>
      </div>
      {/* Separator */}
      <div className="h-auto w-px bg-gray-200 mx-2" />
      {/* Right: Content */}
      <div className="flex-1 flex flex-col">
        <div className="text-sm text-gray-800 whitespace-pre-line bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
          {comment.content}
        </div>
      </div>
    </div>
  );
};

export default CommentMobile;
