import { useMutation } from "@apollo/client";
import { CREATE_CASE } from "../mutation/case";

export type AttachmentInput = {
  filename: string;
  file: string; // base64 string
};

export type CreateCaseInput = {
  content: string;
  type: "PROBLEM" | "SUGGESTION";
  priority: "LOW" | "MEDIUM" | "HIGH";
  attachments?: AttachmentInput[];
  categories: string[];
  creator: string;
};

export const useCreateCase = () => {
  const [createCaseMutation, { data, loading, error }] =
    useMutation(CREATE_CASE);

  const createCase = async (input: CreateCaseInput) => {
    try {
      const response = await createCaseMutation({ variables: { input } });
      return response.data.createCase;
    } catch (err) {
      console.error("Failed to create case:", err);
      throw err;
    }
  };

  return {
    createCase,
    data,
    loading,
    error,
  };
};
