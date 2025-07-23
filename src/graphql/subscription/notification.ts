import { gql } from "@apollo/client";

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotificationAdded($userId: ID!) {
    notificationAdded(userId: $userId) {
      _id
      content
      read
      date
      caseNumber
    }
  }
`;
