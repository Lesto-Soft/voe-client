import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  BanknotesIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { INotification } from "../../db/interfaces";
import { clsx } from "clsx";
import moment from "moment";
import { Trans } from "react-i18next";
import { useNavigate } from "react-router";
import { useMarkAsRead } from "../../graphql/hooks/notificationHook";

interface NotificationItemProps {
  notification: INotification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  // const { t } = useTranslation("menu");
  const navigate = useNavigate();
  const [markAsRead] = useMarkAsRead();

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
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu.Item
      key={notification._id}
      className={clsx(
        "flex items-start gap-4 p-3 text-sm text-gray-700 border-b border-gray-100 last:border-b-0 focus:bg-gray-100 focus:outline-none cursor-pointer hover:bg-gray-50",
        { "font-semibold": !notification.read } // Use font weight for unread
      )}
      onClick={() => {
        markAsRead({ variables: { notificationIds: [notification._id] } });
        navigate(`/case/${notification.caseNumber}`);
      }}
    >
      {/* --- CHANGE: Icon is now a direct child of the flex container --- */}
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

      {/* --- CHANGE: Unread dot is now at the end for a cleaner look --- */}
      {!notification.read && (
        <div className="flex items-center h-full">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </DropdownMenu.Item>
  );
};

export default NotificationItem;
