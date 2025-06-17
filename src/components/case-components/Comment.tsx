import { IComment } from "../../db/interfaces";
import UserLink from "../global/UserLink";
import ShowDate from "../global/ShowDate";
import EditButton from "../global/EditCommentButton";
import { admin_check } from "../../utils/rowStringCheckers";
import { createFileUrl } from "../../utils/fileUtils";
import ImagePreviewModal from "../modals/ImagePreviewModal";
import DeleteModal from "../modals/DeleteModal";
import { useDeleteComment } from "../../graphql/hooks/comment";

interface CommentProps {
  comment: IComment;
  me?: any;
  caseNumber: number;
}

const Comment: React.FC<CommentProps> = ({ comment, me, caseNumber }) => {
  const { deleteComment, error, loading } = useDeleteComment(caseNumber);

  return (
    <div className="flex flex-row items-stretch gap-3 rounded p-3">
      {/* Left: Creator info, vertically centered */}
      <div className="flex flex-col justify-center items-center">
        <UserLink user={comment.creator} />
        {comment.creator.position && (
          <span className="text-xs text-gray-400 italic mt-1 text-center w-full block">
            {comment.creator.position}
          </span>
        )}
      </div>
      {/* Separator */}
      <div className="h-auto w-px bg-gray-200 mx-2" />
      {/* Right: Content */}
      <div className="flex-1 flex flex-col">
        <div className="text-sm text-gray-800 whitespace-pre-line bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
          {comment.content}
        </div>
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {comment.attachments.map((file) => (
              <ImagePreviewModal
                key={file}
                imageUrl={createFileUrl("comments", comment._id, file)}
                fileName={file}
              />
            ))}
          </div>
        )}
      </div>
      <div className="ap-2 mb-1 flex justify-center items-center">
        {me &&
          me.role &&
          (me._id === comment.creator._id || admin_check(me.role.name)) && (
            <>
              <EditButton
                comment={comment}
                currentAttachments={comment.attachments}
                caseNumber={caseNumber}
              />
              <DeleteModal
                title="deleteComment"
                content="deleteCommentInfo"
                onDelete={() => deleteComment(comment._id)}
              />
            </>
          )}
        <ShowDate date={comment.date} />
      </div>
    </div>
  );
};

export default Comment;
