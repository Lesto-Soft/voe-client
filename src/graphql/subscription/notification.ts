import { gql } from "@apollo/client";

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotificationAdded($userId: ID!) {
    notificationAdded(userId: $userId) {
      _id
      content
      read
      date
      caseNumber
      taskNumber
      username
      new_categories
      entityId
    }
  }
`;

export const NOTIFICATIONS_REMOVED_SUBSCRIPTION = gql`
  subscription OnNotificationsRemoved($userId: ID!) {
    notificationsRemoved(userId: $userId)
  }
`;
