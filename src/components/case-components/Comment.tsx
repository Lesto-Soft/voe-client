import { IComment } from "../../db/interfaces";
import ShowDate from "../global/ShowDate";

const Comment = (comment: IComment) => {
  return (
    <div className="bg-gray-50 rounded p-2 flex flex-col">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
        <span>{comment.creator?.name}</span>
        <ShowDate date={comment.date} />
      </div>
      <div>{comment.content}</div>
    </div>
  );
};

export default Comment;
