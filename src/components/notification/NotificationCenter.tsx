import React, { useState, useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BellIcon } from "@heroicons/react/24/outline";
import {
  useDeleteNotifications,
  useGetNotifications,
  useNotificationSubscription,
} from "../../graphql/hooks/notificationHook";
import { INotification } from "../../db/interfaces";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import NotificationItem from "./NotificationItem";
import ConfirmActionDialog from "../modals/ConfirmActionDialog";

interface NotificationCenterProps {
  userId: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
  const { t } = useTranslation("menu");
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [deleteNotifications] = useDeleteNotifications();
  const { data: initialData, loading: initialLoading } = useGetNotifications();

  useNotificationSubscription({
    variables: { userId },
    onData: ({ data }) => {
      const newNotification = data.data?.notificationAdded;
      if (newNotification) {
        setNotifications((prev) => [newNotification, ...prev]);
        toast.info(
          `${t("notification_contents.new_notification")} ${t(
            `notification_contents.${newNotification.content}`,
            { caseNumber: newNotification.caseNumber }
          )}`
        );
      }
    },
    onError: (error) => {
      console.error("Subscription Error:", error);
    },
  });

  useEffect(() => {
    if (initialData?.getUserNotifications) {
      setNotifications(initialData.getUserNotifications);
    }
  }, [initialData]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleDeleteAll = () => {
    deleteNotifications({
      variables: {
        notificationIds: notifications.map((n) => n._id),
      },
    });
    setNotifications([]);
    toast.success(t("notification_contents.all_removed"));
  };

  return (
    <>
      <DropdownMenu.Root open={isDropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            className="cursor-pointer inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="View notifications"
          >
            {/* This wrapper ensures the dot is positioned relative to the icon */}
            <div className="relative">
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
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
              <h3 className="text-lg font-semibold text-gray-800">
                {t("notifications")}
                <span className="text-gray-400">({unreadCount})</span>
              </h3>
              <button
                className="cursor-pointer text-sm text-blue-500 hover:underline"
                onClick={() => {
                  setShowConfirmModal(true);
                  setDropdownOpen(false);
                }}
              >
                {t("notification_contents.remove_all")}
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {initialLoading && (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              )}

              {!initialLoading && notifications.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  You're all caught up! ✨
                </div>
              )}

              {!initialLoading &&
                notifications.map((notif) => (
                  <NotificationItem key={notif._id} notification={notif} />
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
