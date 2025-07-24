import { gql } from "@apollo/client";

export const MARK_NOTIFICATIONS_AS_READ = gql`
  mutation MarkNotificationsAsRead($notificationIds: [ID!]!) {
    markNotificationsAsRead(notificationIds: $notificationIds) {
      _id
    }
  }
`;
export const DELETE_ALL_NOTIFICATIONS = gql`
  mutation DeleteNotifications($notificationIds: [ID!]!) {
    deleteNotifications(notificationIds: $notificationIds)
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($notificationId: ID!) {
    deleteNotification(notificationId: $notificationId)
  }
`;

export const MARK_NOTIFICATIONS_AS_UNREAD = gql`
  mutation MarkNotificationAsUnread($notificationId: ID!) {
    markNotificationAsUnread(notificationId: $notificationId) {
      _id
    }
  }
`;
