import Mention from "@tiptap/extension-mention";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MentionNodeView } from "./MentionNodeView";
import { Attributes } from "@tiptap/core";

export const CustomMention = Mention.extend({
  inclusive: false,

  addNodeView() {
    return ReactNodeViewRenderer(MentionNodeView);
  },

  renderHTML({
    node,
    HTMLAttributes,
  }: {
    node: any;
    HTMLAttributes: Attributes;
  }) {
    return [
      "a",
      {
        ...HTMLAttributes,
        href: `/user/${node.attrs.id}`,
        "data-type": "mention",
        "data-id": node.attrs.id,
        "data-label": node.attrs.label,
        "data-username": node.attrs.username,
        style: "color: blue;",
        target: "_blank",
      },
      `@${node.attrs.label}`,
    ];
  },

  addAttributes() {
    return {
      id: {
        default: null,
      },
      label: {
        default: null,
      },
      username: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "a[data-type='mention']",
        priority: 100,
      },
    ];
  },

  // Ensures CharacterCount includes the full mention text (@label)
  // This must match renderHTML output for consistent counting
  renderText({ node }) {
    return `@${node.attrs.label}`;
  },

  atom: true,
});
