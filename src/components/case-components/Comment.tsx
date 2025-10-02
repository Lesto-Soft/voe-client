import { IComment } from "../../db/interfaces";
import UserLink from "../global/UserLink";
import ShowDate from "../global/ShowDate";
import EditButton from "../global/EditCommentButton";
import { admin_check } from "../../utils/rowStringCheckers";
import { createFileUrl } from "../../utils/fileUtils";
import ImagePreviewModal from "../modals/ImagePreviewModal";
import DeleteModal from "../modals/DeleteModal";
import { renderContentSafely } from "../../utils/contentRenderer";
import { useDeleteComment } from "../../graphql/hooks/comment";
import { useEffect, useRef } from "react";
import UserAvatar from "../cards/UserAvatar";
import ActionMenu from "../global/ActionMenu";

interface CommentProps {
  comment: IComment;
  me?: any;
  caseNumber: number;
  mentions: { name: string; username: string; _id: string }[];
  targetId?: string | null;
  parentType?: "case" | "answer";
}

const Comment: React.FC<CommentProps> = ({
  comment,
  me,
  caseNumber,
  mentions,
  targetId,
  parentType,
}) => {
  const { deleteComment } = useDeleteComment(caseNumber);
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elementId = `${
      parentType === "answer" ? "answers-comment" : "comments"
    }-${comment._id}`;

    if (targetId === elementId && commentRef.current) {
      requestAnimationFrame(() => {
        if (commentRef.current) {
          commentRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          commentRef.current.classList.add("highlight");
          setTimeout(() => {
            commentRef.current?.classList.remove("highlight");
          }, 5000);
        }
      });
    }
  }, [targetId, comment._id, parentType]);
  return (
    <div
      id={`${parentType === "answer" ? "answers-comment" : "comments"}-${
        comment._id
      }`}
      ref={commentRef}
      className={`p-2 mb-1 rounded-md border border-gray-200 transition-all duration-500 ${
        parentType === "answer" ? "" : "bg-white"
      }`}
    >
      {/* --- NEW: COMPACT HEADER --- */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-row items-center justify-center gap-2">
          <UserLink user={comment.creator} />
          <span
            className="text-xs text-gray-400 truncate max-w-20 sm:max-w-28 md:max-w-40 lg:max-w-56"
            title={comment.creator.position}
          >
            {comment.creator.position}
          </span>
        </div>
        {/* Actions (Edit/Delete) */}
        {/* MODIFIED ACTIONS SECTION */}
        <div className="flex items-center gap-1.5">
          <ShowDate date={comment.date} />
          {me &&
            (me._id === comment.creator._id || admin_check(me.role.name)) && (
              <ActionMenu>
                <EditButton
                  comment={comment}
                  currentAttachments={comment.attachments}
                  caseNumber={caseNumber}
                  mentions={mentions}
                  showText={true}
                />
                <DeleteModal
                  title="deleteComment"
                  content="deleteCommentInfo"
                  onDelete={() => deleteComment(comment._id)}
                  showText={true}
                />
              </ActionMenu>
            )}
        </div>
      </div>

      {/* --- CONTENT & ATTACHMENTS --- */}
      <div className="">
        <div className="text-sm text-gray-800 whitespace-pre-line bg-gray-50 rounded p-2 max-h-38 overflow-y-auto break-words custom-scrollbar-xs">
          {renderContentSafely(comment.content)}
        </div>
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
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

export default Comment;
