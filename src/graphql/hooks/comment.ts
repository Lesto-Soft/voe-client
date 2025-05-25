import { useMutation, useQuery } from "@apollo/client";
import { ADD_COMMENT, UPDATE_COMMENT } from "../mutation/comment";
import { GET_CASE_BY_CASE_NUMBER } from "../query/case";
import { AttachmentInput } from "./case";

export type CreateCommentInput = {
  case?: string;
  answer?: string;
  content: string;
  creator: string;
  attachments?: AttachmentInput[];
};

export const useCreateComment = (caseNumber: number) => {
  const [createCommentMutation, { data, loading, error }] = useMutation(
    ADD_COMMENT,
    {
      refetchQueries: [
        { query: GET_CASE_BY_CASE_NUMBER, variables: { caseNumber } },
      ],
      awaitRefetchQueries: true,
    }
  );
  const createComment = async (input: CreateCommentInput) => {
    try {
      const { data } = await createCommentMutation({
        variables: { input },
      });
      return data.createComment;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  return { createComment, data, loading, error };
};

export const useUpdateComment = (caseNumber: number) => {
  const [updateCommentMutation, { data, loading, error }] = useMutation(
    UPDATE_COMMENT,
    {
      refetchQueries: [
        { query: GET_CASE_BY_CASE_NUMBER, variables: { caseNumber } },
      ],
      awaitRefetchQueries: true,
    }
  );

  const updateComment = async (
    input: {
      content: string;
      attachments?: AttachmentInput[];
    },
    id: string
  ) => {
    try {
      console.log(input.attachments);

      const { data } = await updateCommentMutation({
        variables: { input, id },
      });
      return data.updateComment;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  };

  return { updateComment, data, loading, error };
};
