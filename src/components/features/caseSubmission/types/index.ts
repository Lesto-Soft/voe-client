// src/features/caseSubmission/types/index.ts
import { ICategory as GlobalICategory } from "../../../../db/interfaces"; // Adjusted path
import {
  CreateCaseInput as GlobalCreateCaseInput,
  AttachmentInput as GlobalAttachmentInput,
} from "../../../../graphql/hooks/case"; // Adjusted path

// Category structure used within the submission form
export interface FormCategory
  extends Pick<GlobalICategory, "_id" | "name" | "problem" | "suggestion"> {}

// For the user fetched by username
export interface FetchedUserInfo {
  _id: string;
  name: string;
}

// Input type for the createCase mutation (can be re-exported or defined if specific variations needed)
export type CreateCaseMutationInput = GlobalCreateCaseInput;

// Attachment input type for the mutation (can be re-exported)
export type CaseAttachmentInput = GlobalAttachmentInput;

// Structure for the data returned by the user lookup query
export interface UserQueryResult {
  getLeanUserByUsername: FetchedUserInfo | null;
}

// Variables for the user lookup query
export interface UserQueryVars {
  username: string;
}
