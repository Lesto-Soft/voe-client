import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  BanknotesIcon,
  HandThumbUpIcon,
  EnvelopeOpenIcon,
  EnvelopeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { INotification } from "../../db/interfaces";
import { clsx } from "clsx";
import moment from "moment";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
  useDeleteNotification,
  useMarkAsRead,
  useMarkAsUnread,
} from "../../graphql/hooks/notificationHook";
import { AcademicCapIcon, AtSymbolIcon } from "@heroicons/react/24/solid";

interface NotificationItemProps {
  notification: INotification;
  setDropdownOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  setDropdownOpen,
}) => {
  const navigate = useNavigate();
  const [markAsRead] = useMarkAsRead();
  const [deleteNotification] = useDeleteNotification();
  const [markAsUnread] = useMarkAsUnread();
  const { t } = useTranslation("menu");

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_comment":
        return (
          <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-purple-500" />
        );
      case "new_case":
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case "new_answer":
        return (
          <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-green-500" />
        );
      case "approve_answer_close_case":
        return <HandThumbUpIcon className="h-5 w-5 text-green-600" />;
      case "approve_answer_await_finance_case":
        return <BanknotesIcon className="h-5 w-5 text-gray-500" />;
      case "approve_answer_finance_case":
        return <BanknotesIcon className="h-5 w-5 text-green-500" />;
      case "add_expert_to_category":
        return <AcademicCapIcon className="h-5 w-5 text-yellow-500" />;
      case "add_manager_to_category":
        return <AcademicCapIcon className="h-5 w-5 text-blue-600" />;
      case "add_financial_approver":
        return <BanknotesIcon className="h-5 w-5 text-green-500" />;
      case "mention_in_answer":
        return <AtSymbolIcon className="h-5 w-5 text-green-600" />;
      case "mention_in_comment":
        return <AtSymbolIcon className="h-5 w-5 text-purple-600" />;
      case "mention_in_answer_comment":
        return <AtSymbolIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead({ variables: { notificationIds: [notification._id] } });
  };

  const handleMarkAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsUnread({ variables: { notificationId: notification._id } });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification({ variables: { notificationId: notification._id } });
  };

  return (
    <DropdownMenu.Item
      key={notification._id}
      // The `onSelect` event is often better for Radix, but we'll prevent its default behavior for the main click.
      onSelect={(e) => e.preventDefault()}
      className={clsx(
        "group flex items-center gap-3 p-3 text-sm text-gray-700 border-b border-gray-100 last:border-b-0 focus:bg-gray-100 focus:outline-none cursor-pointer hover:bg-gray-50",
        { "font-semibold": !notification.read }
      )}
    >
      {/* Main clickable area for navigation */}
      <div
        className="flex flex-1 items-start gap-4 min-w-0"
        onClick={() => {
          if (setDropdownOpen) setDropdownOpen(false);
          markAsRead({ variables: { notificationIds: [notification._id] } });
          const { content, caseNumber, entityId, username } = notification;
          if (caseNumber && entityId) {
            if (content.includes("answer_comment")) {
              return navigate(
                `/case/${caseNumber}#answers-${entityId}?comment=true`
              );
            }
            if (content.includes("comment")) {
              return navigate(`/case/${caseNumber}#comments-${entityId}`);
            }
            if (content.includes("answer")) {
              return navigate(`/case/${caseNumber}#answers-${entityId}`);
            }
          }
          if (caseNumber) {
            return navigate(`/case/${caseNumber}`);
          }
          if (username) {
            return navigate(`/user/${username}`);
          }
        }}
      >
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.content)}
        </div>

        {/* --- CHANGE: Content and time are now stacked in their own column --- */}
        <div className="flex flex-col flex-1 min-w-0">
          <div
            className={clsx("break-words", {
              "text-gray-900": !notification.read,
              "text-gray-600": notification.read,
            })}
          >
            <Trans
              i18nKey={`notification_contents.${notification.content}`}
              ns="menu"
              values={{
                caseNumber: notification.caseNumber,
                username: notification.username,
                categoryName: notification.new_categories
                  ? notification.new_categories.join(", ")
                  : "",
              }}
              components={{
                1: (
                  <span
                    className={!notification.read ? "font-bold" : "font-normal"}
                  />
                ),
              }}
            />
          </div>
          <small
            className={clsx("mt-1 text-xs", {
              "text-blue-600": !notification.read,
              "text-gray-400": notification.read,
            })}
          >
            {moment(parseInt(notification.date)).fromNow()}
          </small>
        </div>
      </div>
      {/* Container for the unread dot and action buttons */}
      <div className="relative flex items-center justify-end flex-shrink-0 w-8 h-full">
        {/* Unread indicator dot: Shows when NOT hovering */}
        {!notification.read && (
          <div className="group-hover:opacity-0 transition-opacity w-2 h-2 bg-blue-500 rounded-full" />
        )}

        {/* Action Buttons: Positioned absolutely within the container, shown on hover */}
        <div className="absolute inset-0 hidden group-hover:flex flex-col items-center justify-center space-y-2">
          {notification.read ? (
            // If the notification is READ, show "Mark as Unread" button
            <button
              onClick={handleMarkAsUnread}
              className="p-1 rounded-full hover:bg-gray-200 cursor-pointer"
              title={t("notification_contents.mark_as_unread")}
            >
              <EnvelopeIcon className="h-5 w-5 text-gray-600" />
            </button>
          ) : (
            <button
              onClick={handleMarkAsRead}
              className="p-1 rounded-full hover:bg-gray-200 cursor-pointer"
              title={t("notification_contents.mark_as_read")}
            >
              <EnvelopeOpenIcon className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1 rounded-full hover:bg-gray-200 cursor-pointer"
            title={t("notification_contents.delete_notification")}
          >
            <TrashIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </DropdownMenu.Item>
  );
};

export default NotificationItem;
