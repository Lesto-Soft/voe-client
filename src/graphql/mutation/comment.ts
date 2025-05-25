import { gql } from "@apollo/client";

export const ADD_COMMENT = gql`
  mutation CreateComment($input: createCommentInput!) {
    createComment(input: $input) {
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
