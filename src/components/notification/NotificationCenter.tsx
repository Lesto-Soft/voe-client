import React, { useState, useEffect, useMemo } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  useDeleteNotifications,
  useGetNotifications,
  useNotificationSubscription,
  useNotificationsRemovedSubscription,
  useMarkAsRead,
} from "../../graphql/hooks/notificationHook";
import { INotification } from "../../db/interfaces";
import { toast } from "react-toastify";
import { useTranslation, Trans } from "react-i18next";
import NotificationItem from "./NotificationItem";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";
import {
  RectangleStackIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";
import { BellIcon } from "@heroicons/react/24/outline";

interface NotificationCenterProps {
  userId: string;
}

type NotificationTab = "ALL" | "CASES" | "ANSWERS" | "COMMENTS" | "TASKS";
const filterMap: Record<
  Exclude<NotificationTab, "ALL">,
  string[]
> = {
  CASES: [
    "new_case",
    "approve_answer_close_case",
    "reopen_case",
    "case_reminder",
  ],
  ANSWERS: [
    "new_answer",
    "approve_answer_await_finance_case",
    "approve_answer_finance_case",
    "mention_in_answer",
  ],
  COMMENTS: [
    "new_comment_case",
    "new_answer_comment",
    "mention_in_comment",
    "mention_in_answer_comment",
  ],
  TASKS: [
    "new_task_comment",
    "new_task_help_request",
    "new_task_approval_request",
    "mention_in_task_comment",
    "mention_in_task_help_request",
    "mention_in_task_approval_request",
    "task_closed",
    "task_reopened",
    "new_task_analysis",
    "task_assignee_changed",
    "task_priority_changed",
    "task_description_changed",
    "task_due_approaching",
    "task_overdue_reminder",
    "task_due_passed",
    "task_assigned",
    "task_deleted",
  ],
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
  const { t } = useTranslation("menu");
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [deleteNotifications] = useDeleteNotifications();
  const [activeTab, setActiveTab] = useState<NotificationTab>("ALL");
  const [markAsRead] = useMarkAsRead();

  const {
    data: initialData,
    loading: initialLoading,
    refetch,
  } = useGetNotifications();

  useNotificationSubscription({
    variables: { userId },
    onData: ({ data }) => {
      refetch();
      const newNotification = data.data?.notificationAdded;
      if (newNotification) {
        setNotifications((prev) => [newNotification, ...prev]);
        const toastMessage = (
          <div>
            <Trans
              i18nKey={`notification_contents.${newNotification.content}`}
              ns="menu"
              values={{
                caseNumber: newNotification.caseNumber,
                taskNumber: newNotification.taskNumber,
                username: newNotification.username,
                categoryName: newNotification.new_categories
                  ? newNotification.new_categories.join(", ")
                  : "",
              }}
              components={{ 1: <span className="font-bold" /> }}
            />
          </div>
        );
        // only show notifications if the notification dropdown is not open
        if (!isDropdownOpen) {
          toast.info(toastMessage, {
            className: "notification-toast",
          });
        }
      }
    },
    onError: (error) => {
      console.error("Subscription Error:", error);
    },
  });
  useNotificationsRemovedSubscription({
    variables: { userId },
    onData: ({ data }) => {
      const removedIds = data.data?.notificationsRemoved;
      if (removedIds && removedIds.length > 0) {
        const removedIdSet = new Set(removedIds);
        setNotifications((prev) => {
          const newState = prev.filter((notif) => !removedIdSet.has(notif._id));
          return newState;
        });
      }
    },
    onError: (error) => {
      console.error("Notifications Removed Subscription Error:", error);
    },
  });
  useEffect(() => {
    if (initialData?.getUserNotifications) {
      setNotifications(initialData.getUserNotifications);
    }
  }, [initialData]);

  useEffect(() => {
    let isThrottled = false;
    const handleScroll = () => {
      if (isThrottled) return;

      isThrottled = true;
      setTimeout(() => {
        if (window.scrollY > 50) {
          document.body.classList.add("scrolled");
        } else {
          document.body.classList.remove("scrolled");
        }
        isThrottled = false;
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabs: {
    name: NotificationTab;
    icon: React.ElementType;
    title: string;
  }[] = [
    {
      name: "ALL",
      icon: RectangleStackIcon,
      title: t("notification_contents.all"),
    },
    // { name: "UNREAD", icon: EnvelopeIcon, title: t("Unread") },
    {
      name: "CASES",
      icon: DocumentTextIcon,
      title: t("notification_contents.cases"),
    },
    {
      name: "ANSWERS",
      icon: ChatBubbleBottomCenterTextIcon,
      title: t("notification_contents.answers"),
    },
    {
      name: "COMMENTS",
      icon: ChatBubbleOvalLeftEllipsisIcon,
      title: t("notification_contents.comments"),
    },
    {
      name: "TASKS",
      icon: ClipboardDocumentListIcon,
      title: t("notification_contents.tasks"),
    },
  ];
  const unreadCountsByTab = useMemo(() => {
    const counts: Record<NotificationTab, number> = {
      ALL: 0,
      CASES: 0,
      ANSWERS: 0,
      COMMENTS: 0,
      TASKS: 0,
    };
    const unreadNotifications = notifications.filter((n) => !n.read);
    counts.ALL = unreadNotifications.length;

    unreadNotifications.forEach((n) => {
      if (filterMap.CASES.includes(n.content)) counts.CASES++;
      if (filterMap.ANSWERS.includes(n.content)) counts.ANSWERS++;
      if (filterMap.COMMENTS.includes(n.content)) counts.COMMENTS++;
      if (filterMap.TASKS.includes(n.content)) counts.TASKS++;
    });

    return counts;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "ALL") {
      return notifications;
    }

    const keywords = filterMap[activeTab];
    return notifications.filter((n) => keywords.includes(n.content));
  }, [notifications, activeTab]);

  const unreadNotificationsInTab = useMemo(() => {
    return filteredNotifications.filter((n) => !n.read);
  }, [filteredNotifications]);

  const handleMarkTabAsRead = () => {
    const idsToMark = unreadNotificationsInTab.map((n) => n._id);
    if (idsToMark.length === 0) return;

    markAsRead({ variables: { notificationIds: idsToMark } })
      .then(() => {
        const idSet = new Set(idsToMark);
        setNotifications((prev) =>
          prev.map((n) => (idSet.has(n._id) ? { ...n, read: true } : n)),
        );
      })
      .catch((err) => {
        console.error("Failed to mark notifications as read:", err);
        toast.error("Could not mark notifications as read.");
      });
  };

  const handleDeleteAll = () => {
    deleteNotifications({
      variables: {
        notificationIds: filteredNotifications.map((n) => n._id),
      },
    });
    setNotifications([]);
    toast.success(t("notification_contents.all_removed"), {
      className: "notification-toast",
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleDropdownOpenChange = (open: boolean) => {
    if (open) {
      toast.dismiss();
    }
    setDropdownOpen(open);
  };

  return (
    <>
      <DropdownMenu.Root
        open={isDropdownOpen}
        onOpenChange={handleDropdownOpenChange}
      >
        <DropdownMenu.Trigger asChild>
          <button
            className="cursor-pointer inline-flex items-center justify-center p-2 text-gray-600 focus:outline-none hover:text-gray-900 rounded-full transition-colors duration-150 hover:bg-gray-300 data-[state=open]:bg-gray-500 data-[state=open]:text-gray-100"
            aria-label={t("notification_contents.view_notifications")}
            title={t("notification_contents.view_notifications")}
          >
            {/* This wrapper ensures the dot is positioned relative to the icon */}
            <div className="relative">
              <BellIcon className="h-6 w-6" />
              {unreadCountsByTab.ALL > 0 && (
                <span className="absolute top-0 right-0 block h-3 w-3 transform -translate-y-1/4 translate-x-1/4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                </span>
              )}
            </div>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={5}
            className="z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200"
            align="end"
          >
            <div className="p-3 border-b border-gray-200 flex justify-between">
              <h3 className="text-md font-semibold text-gray-800">
                {t("notifications")}
                <span className="text-md font-normal text-gray-400">
                  {" "}
                  ({unreadCountsByTab.ALL})
                </span>
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  className="cursor-pointer text-sm text-blue-500 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
                  onClick={handleMarkTabAsRead}
                  title={t("notification_contents.mark_all_read_title")}
                  disabled={unreadNotificationsInTab.length === 0}
                >
                  {t("notification_contents.mark_all_read", "Mark as Read")}
                </button>
                <button
                  className="cursor-pointer text-sm text-blue-500 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
                  onClick={() => {
                    setShowConfirmModal(true);
                    setDropdownOpen(false);
                  }}
                  title={t("notification_contents.remove_all_title")}
                  disabled={filteredNotifications.length === 0}
                >
                  {t("notification_contents.remove_all")}
                </button>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex justify-around p-1 border-b border-gray-200 bg-gray-50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const count = unreadCountsByTab[tab.name];
                const isActive = activeTab === tab.name;

                return (
                  <button
                    key={tab.name}
                    onClick={() => {
                      toast.dismiss();
                      setActiveTab(tab.name);
                    }}
                    className={`cursor-pointer mx-0.5 p-2 rounded-md transition-colors duration-150 flex items-center justify-center flex-1 relative ${
                      isActive
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-500 hover:bg-gray-200"
                    }`}
                    title={tab.title}
                  >
                    <Icon className="h-5 w-5" />
                    {count > 0 && (
                      <span className="absolute top-1 right-4 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {initialLoading && (
                <div className="p-4 text-center text-gray-500">
                  {t("notification_contents.loading", "Зареждане...")}
                </div>
              )}

              {!initialLoading && filteredNotifications.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  {t("notification_contents.no_notifications")}
                </div>
              )}

              {!initialLoading &&
                filteredNotifications.map((notif) => (
                  <NotificationItem
                    key={notif._id}
                    notification={notif}
                    setDropdownOpen={setDropdownOpen}
                  />
                ))}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ConfirmActionDialog
        isOpen={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        onConfirm={handleDeleteAll}
        title={t("notification_contents.remove_title")}
        description={t("notification_contents.remove_desc")}
        confirmButtonText={t("notification_contents.remove_all")}
        cancelButtonText={t("notification_contents.cancel")}
        isDestructiveAction={true}
      />
    </>
  );
};

export default NotificationCenter;
