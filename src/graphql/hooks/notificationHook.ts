import { useQuery, useSubscription, useMutation } from "@apollo/client";
import { GET_NOTIFICATIONS } from "../query/notificationQuery";
import {
  NOTIFICATION_SUBSCRIPTION,
  NOTIFICATIONS_REMOVED_SUBSCRIPTION,
} from "../subscription/notification";
import {
  DELETE_ALL_NOTIFICATIONS,
  DELETE_NOTIFICATION,
  MARK_NOTIFICATIONS_AS_READ,
  MARK_NOTIFICATIONS_AS_UNREAD,
} from "../mutation/notificationMutation";

export const useGetNotifications = () => {
  return useQuery(GET_NOTIFICATIONS);
};

export const useNotificationSubscription = (options: {
  variables: { userId: string };
  onData: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  return useSubscription(NOTIFICATION_SUBSCRIPTION, options);
};

export const useMarkAsRead = () => {
  return useMutation(MARK_NOTIFICATIONS_AS_READ, {
    refetchQueries: [GET_NOTIFICATIONS],
    onError: (error) => {
      console.error("Error marking notifications as read:", error);
    },
  });
};

export const useDeleteNotifications = () => {
  return useMutation(DELETE_ALL_NOTIFICATIONS, {
    refetchQueries: [GET_NOTIFICATIONS],
    onError: (error) => {
      console.error("Error deleting notifications:", error);
    },
  });
};

export const useDeleteNotification = () => {
  return useMutation(DELETE_NOTIFICATION, {
    refetchQueries: [GET_NOTIFICATIONS],
    onError: (error) => {
      alert("Error deleting notification");
      console.error("Error deleting notification:", error);
    },
  });
};

export const useMarkAsUnread = () => {
  return useMutation(MARK_NOTIFICATIONS_AS_UNREAD, {
    refetchQueries: [GET_NOTIFICATIONS],
    onError: (error) => {
      console.error("Error marking notifications as unread:", error);
    },
  });
};

export const useNotificationsRemovedSubscription = (options: {
  variables: { userId: string };
  onData: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  return useSubscription(NOTIFICATIONS_REMOVED_SUBSCRIPTION, options);
};
