import { IComment } from "../../../db/interfaces";
import UserLink from "../../global/links/UserLink";
import ShowDate from "../../global/ShowDate";
import EditButton from "../../global/EditCommentButton";
import { admin_check } from "../../../utils/rowStringCheckers";
import { createFileUrl } from "../../../utils/fileUtils";
import ImagePreviewModal, {
  GalleryItem,
} from "../../modals/imageModals/ImagePreviewModal";
import DeleteModal from "../../modals/DeleteModal";
import { renderContentSafely } from "../../../utils/contentRenderer";
import { useDeleteComment } from "../../../graphql/hooks/comment";
import { useEffect, useRef, useMemo, useState } from "react";
// import UserAvatar from "../cards/UserAvatar";
import ActionMenu from "../../global/ActionMenu";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

interface CommentProps {
  comment: IComment;
  me?: any;
  caseNumber: number;
  mentions: { name: string; username: string; _id: string }[];
  targetId?: string | null;
  parentType?: "case" | "answer";
  displayNumber?: number | string;
  expandAllContent?: boolean;
}

const Comment: React.FC<CommentProps> = ({
  comment,
  me,
  caseNumber,
  mentions,
  targetId,
  parentType,
  displayNumber,
  expandAllContent = false,
}) => {
  const { deleteComment } = useDeleteComment(caseNumber);
  const commentRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isContentOverflowing, setIsContentOverflowing] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(expandAllContent);

  // Snap to the feed-wide expand/collapse-all preference when it changes;
  // the per-comment toggle still works on top of it
  useEffect(() => {
    setIsContentExpanded(expandAllContent);
  }, [expandAllContent]);

  // Height of the collapsed content box (max-h-38 = 152px). Comparing
  // scrollHeight against it detects "would overflow when clamped" regardless of
  // the current expansion state, so short comments never get a toggle button.
  const COMMENT_CONTENT_CLAMP_PX = 152;

  useEffect(() => {
    const el = contentRef.current;
    if (el) setIsContentOverflowing(el.scrollHeight > COMMENT_CONTENT_CLAMP_PX);
  }, [comment.content]);

  useEffect(() => {
    const elementId = `${
      parentType === "answer" ? "answers-comment" : "comments"
    }-${comment._id}`;
    const element = commentRef.current;

    if (!element) return;

    let removalTimerId: ReturnType<typeof setTimeout>;
    let animationFrameId: number;

    if (targetId === elementId) {
      animationFrameId = requestAnimationFrame(() => {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        element.classList.add("highlight");
        removalTimerId = setTimeout(() => {
          element.classList.remove("highlight");
        }, 5000);
      });
    }

    // Cleanup function to run when dependencies change or component unmounts
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(removalTimerId);
      if (element.classList.contains("highlight")) {
        element.classList.remove("highlight");
      }
    };
  }, [targetId, comment._id, parentType]);

  const galleryItems: GalleryItem[] = useMemo(() => {
    return (comment.attachments || []).map((file) => ({
      url: createFileUrl("comments", comment._id, file),
      name: file,
    }));
  }, [comment.attachments, comment._id]);

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
      <div className="flex items-center justify-between gap-4 mb-2">
        {/* Left Side: User Info
  - `min-w-0` is the key here. It allows the child elements inside
   this flex container to truncate properly.
 */}
        <div className="flex min-w-0 flex-row items-center gap-2">
          {displayNumber != null && (
            <span className="text-xs font-bold text-gray-400 flex-shrink-0">
              #{displayNumber}
            </span>
          )}
          {/* `flex-shrink-0` prevents the UserLink from being squished */}
          <div className="flex-shrink-0">
            <UserLink user={comment.creator} />
          </div>
          <span
            className="truncate text-xs text-gray-400"
            title={comment.creator.position}
          >
            {comment.creator.position}
          </span>
        </div>

        {/* Right Side: Actions
  - `flex-shrink-0` ensures this section is never squished and keeps its position.
 */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <ShowDate collapsible={true} date={comment.date} />
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
        {isContentOverflowing && (
          <button
            onClick={() => setIsContentExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mb-1 cursor-pointer"
          >
            {isContentExpanded ? (
              <>
                Скрий <ChevronUpIcon className="h-3 w-3" />
              </>
            ) : (
              <>
                Покажи цялото съдържание <ChevronDownIcon className="h-3 w-3" />
              </>
            )}
          </button>
        )}
        <div
          ref={contentRef}
          className={`text-sm text-gray-800 whitespace-pre-line bg-gray-50 rounded p-2 break-words custom-scrollbar-xs ${
            isContentExpanded ? "" : "max-h-38 overflow-y-auto"
          }`}
        >
          {renderContentSafely(comment.content)}
        </div>
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {comment.attachments.map((file) => (
              <ImagePreviewModal
                key={file}
                galleryItems={galleryItems}
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
