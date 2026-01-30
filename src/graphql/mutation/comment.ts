import { gql } from "@apollo/client";

export const ADD_COMMENT = gql`
  mutation CreateComment(
    $case: ID
    $answer: ID
    $content: String!
    $creator: ID!
    $attachments: [Upload!]
  ) {
    createComment(
      input: {
        creator: $creator
        content: $content
        attachments: $attachments
        case: $case
        answer: $answer
      }
    ) {
      _id
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation Mutation($input: updateCommentInput!, $id: ID!) {
    updateComment(input: $input, _id: $id) {
      _id
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(_id: $id) {
      _id
    }
  }
`;
