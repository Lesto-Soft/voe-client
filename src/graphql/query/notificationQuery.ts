import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query GetMyNotifications {
    getUserNotifications {
      _id
      content
      read
      date
      caseNumber
      username
      new_categories
      entityId
    }
  }
`;
