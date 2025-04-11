// Shape of categories returned by useGetActiveCategories hook
export interface Category {
  _id: string;
  name: string;
  problem?: string;
  suggestion?: string;
}

// Shape of attachment input for mutation (matches Zod/GraphQL)
export interface AttachmentInput {
  filename: string;
  file: string; // base64 string
}

// Shape of the user query data result
export interface UserQueryResult {
  getLeanUserByUsername: {
    _id: string;
    name: string;
  } | null;
}

// Variables type for the user query
export interface UserQueryVars {
  username: string;
}

// Case Type from URL
export type CaseTypeParam = "PROBLEM" | "SUGGESTION" | null;

// Priority Type from State/Input
export type CasePriority = "LOW" | "MEDIUM" | "HIGH";

// Props for CaseFormLeftPanel component (example)
// Define similar prop types for other new components as needed
export interface CaseFormLeftPanelProps {
  usernameInput: string;
  handleUsernameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  userLoading: boolean;
  userError: import("@apollo/client").ApolloError | undefined;
  usernameError: string | null;
  notFoundUsername: string | null;
  fetchedName: string;
  content: string;
  handleContentChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  contentError: string | null;
  attachments: File[];
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAttachment: (filename: string) => void;
  fileError: string | null;
  maxFiles: number;
  maxFileSizeMB: number;
}

// Define other props interfaces (CaseFormHeaderProps, CaseFormRightPanelProps) similarly...
