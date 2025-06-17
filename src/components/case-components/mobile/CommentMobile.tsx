import { IComment } from "../../../db/interfaces";
import UserLink from "../../global/UserLink";
import ShowDate from "../../global/ShowDate";
import EditButton from "../../global/EditCommentButton";
import { admin_check } from "../../../utils/rowStringCheckers";
import ImagePreviewModal from "../../modals/ImagePreviewModal";
import { createFileUrl } from "../../../utils/fileUtils";
import DeleteModal from "../../modals/DeleteModal";
import { useDeleteComment } from "../../../graphql/hooks/comment";

interface CommentProps {
  comment: IComment;
  me?: any;
  caseNumber: number;
}

const CommentMobile: React.FC<CommentProps> = ({ comment, me, caseNumber }) => {
  const { deleteComment, error, loading } = useDeleteComment(caseNumber);

  return (
    <div className="flex flex-row items-stretch gap-3 rounded p-3 w-full px-4">
      {/* Left: Creator info, vertically centered */}
      <div className="flex flex-col justify-center items-center">
        <UserLink user={comment.creator} />
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
              <div className="flex items-center gap-2 mt-2">
                <EditButton
                  comment={comment}
                  currentAttachments={comment.attachments}
                  caseNumber={caseNumber}
                />
                <DeleteModal
                  title="Delete Comment"
                  content="Are you sure you want to delete this comment? This action cannot be undone."
                  onDelete={() => deleteComment(comment._id)}
                />
              </div>
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
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 mt-2">
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
    </div>
  );
};

export default CommentMobile;
