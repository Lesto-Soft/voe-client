import React, { useState } from "react";
import { ITaskActivity, IMe, TaskActivityType } from "../../db/interfaces";
import { useCreateTaskActivity } from "../../graphql/hooks/task";
import UserLink from "../global/links/UserLink";
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

interface TaskActivitiesProps {
  taskId: string;
  activities: ITaskActivity[];
  currentUser: IMe;
  refetch: () => void;
}

const TaskActivities: React.FC<TaskActivitiesProps> = ({
  taskId,
  activities,
  currentUser,
  refetch,
}) => {
  const [newComment, setNewComment] = useState("");
  const { createTaskActivity, loading } = useCreateTaskActivity(taskId);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || loading) return;

    try {
      await createTaskActivity({
        task: taskId,
        createdBy: currentUser._id,
        type: TaskActivityType.Comment,
        content: newComment.trim(),
      });
      setNewComment("");
      refetch();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("bg-BG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter to only show comments
  const comments = activities.filter(
    (activity) => activity.type === TaskActivityType.Comment
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" />
        Коментари ({comments.length})
      </h2>

      {/* Comment input */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Добавете коментар..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!newComment.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {loading ? "Изпращане..." : "Изпрати"}
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Няма коментари все още. Бъдете първият!
          </p>
        ) : (
          comments.map((activity) => (
            <div
              key={activity._id}
              className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <UserLink user={activity.createdBy} />
                    <span className="text-xs text-gray-500">
                      {formatDateTime(activity.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {activity.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskActivities;
