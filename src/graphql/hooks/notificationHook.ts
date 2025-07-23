import { useQuery, useSubscription, useMutation } from "@apollo/client";
import { GET_NOTIFICATIONS } from "../query/notificationQuery";
import { NOTIFICATION_SUBSCRIPTION } from "../subscription/notification";
import {
  DELETE_ALL_NOTIFICATIONS,
  MARK_NOTIFICATIONS_AS_READ,
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
