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
