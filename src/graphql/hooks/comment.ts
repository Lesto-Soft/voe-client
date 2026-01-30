import { useMutation } from "@apollo/client";
import {
  ADD_COMMENT,
  DELETE_COMMENT,
  UPDATE_COMMENT,
} from "../mutation/comment";
import { GET_CASE_BY_CASE_NUMBER } from "../query/case";
import { AttachmentInput } from "./case";
import { UpdateCommentInput } from "../../components/global/EditCommentButton";

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
        variables: input,
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

  const updateComment = async (input: UpdateCommentInput, id: string) => {
    try {
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

export const useDeleteComment = (caseNumber: number) => {
  const [deleteCommentMutation, { data, loading, error }] = useMutation(
    DELETE_COMMENT,
    {
      refetchQueries: [
        { query: GET_CASE_BY_CASE_NUMBER, variables: { caseNumber } },
      ],
      awaitRefetchQueries: true,
    }
  );

  const deleteComment = async (id: string) => {
    try {
      const { data } = await deleteCommentMutation({
        variables: { id },
      });
      return data.deleteComment;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  };

  return { deleteComment, data, loading, error };
};
