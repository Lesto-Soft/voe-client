import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance, type Props } from "tippy.js";
import MentionList, { type MentionListRef } from "./MentionList";
import { Editor } from "@tiptap/core";

export interface MentionUser {
  _id: string;
  name: string;
  username: string;
}

const getExistingMentionIds = (editor: Editor): Set<string> => {
  const ids = new Set<string>();

  editor.state.doc.descendants((node) => {
    if (node.type.name === "mention-link") {
      ids.add(node.attrs.id);
    }
  });

  return ids;
};

export const createMentionSuggestion = (mentions: MentionUser[] = []) => ({
  items: async ({ query }: { query: string }): Promise<MentionUser[]> => {
    return mentions.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
    );
  },
  allowedPrefixes: [" ", "\u00A0"],

  render: () => {
    let component: ReactRenderer<MentionListRef>;
    let popup: Instance<Props>[];

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () =>
            document.querySelector("#edit-comment-popup-container") ||
            document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate: (props: any) => {
        component.updateProps(props);
        if (!props.clientRect) return;
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown: (props: { event: KeyboardEvent }): boolean => {
        if (props.event.key === "Escape") {
          popup[0].hide();
          return true;
        }
        return component.ref?.onKeyDown(props) ?? false;
      },

      onExit: () => {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
});
