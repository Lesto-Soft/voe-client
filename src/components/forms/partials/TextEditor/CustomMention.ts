import Mention from "@tiptap/extension-mention";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MentionNodeView } from "./MentionNodeView";
import { Attributes } from "@tiptap/core";

export const CustomMention = Mention.extend({
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

  // 👇 CHANGED: We are now declaring all attributes manually.
  // This avoids the 'this.parent' error completely.
  addAttributes() {
    return {
      // Default attributes from the Mention extension
      id: {
        default: null,
      },
      label: {
        default: null,
      },
      // Your new custom attribute
      username: {
        default: null,
      },
    };
  },

  // This keeps the cursor from getting stuck.
  atom: true,
});
