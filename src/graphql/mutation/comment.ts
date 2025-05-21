import { gql } from "@apollo/client";

export const ADD_COMMENT = gql`
  mutation CreateComment($input: createCommentInput!) {
    createComment(input: $input) {
      _id
    }
  }
`;
