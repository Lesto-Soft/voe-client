import { useMutation, useQuery } from "@apollo/client";
import { ADD_COMMENT } from "../mutation/comment";
import { AttachmentInput } from "./case";

export type CreateCommentInput = {
  case?: string;
  answer?: string;
  content: string;
  creator: string;
  attachments?: AttachmentInput[];
};

export const useCreateComment = () => {
  const [createCommentMutation, { data, loading, error }] = useMutation(
    ADD_COMMENT,
    {
      refetchQueries: ["GetAllComments"],
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
