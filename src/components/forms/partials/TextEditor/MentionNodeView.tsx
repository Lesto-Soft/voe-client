// src/components/forms/partials/TextEditor/MentionNodeView.tsx
import React from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { KeywordLink } from "./KeywordLink"; // Ensure this path is correct

export const MentionNodeView: React.FC<NodeViewProps> = ({ node }) => {
  const { id: username, label: name } = node.attrs;
  return (
    <NodeViewWrapper as="span">
      <KeywordLink keyword={username} label={`@${name}`} />
    </NodeViewWrapper>
  );
};
