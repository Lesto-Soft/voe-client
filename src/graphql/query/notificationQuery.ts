import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query GetMyNotifications {
    getUserNotifications {
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
