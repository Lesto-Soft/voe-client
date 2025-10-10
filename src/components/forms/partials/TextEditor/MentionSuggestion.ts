// src/components/forms/partials/TextEditor/MentionSuggestion.ts
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance, type Props } from "tippy.js";
import MentionList, { type MentionListRef } from "./MentionList";
// import { Editor } from "@tiptap/core";

export interface MentionUser {
  _id: string;
  name: string;
  username: string;
}

// const getExistingMentionIds = (editor: Editor): Set<string> => {
// const ids = new Set<string>();

// editor.state.doc.descendants((node) => {
//  if (node.type.name === "mention-link") {
//   ids.add(node.attrs.id);
//  }
// });

// return ids;
// };

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
    let backdropElement: HTMLDivElement | null = null; // MODIFICATION: Add backdrop variable

    // MODIFICATION: Function to create and show the modal backdrop
    const showBackdrop = () => {
      if (backdropElement) return;
      backdropElement = document.createElement("div");
      // This class will cover the screen and intercept mouse events.
      // z-40 is chosen assuming the editor/tippy popup is z-50 or higher.
      backdropElement.className = "fixed inset-0 z-40";
      document.body.appendChild(backdropElement);
      document.body.classList.add("overflow-hidden");
    };

    // MODIFICATION: Function to hide and remove the modal backdrop
    const hideBackdrop = () => {
      if (backdropElement) {
        backdropElement.remove();
        backdropElement = null;
      }
      document.body.classList.remove("overflow-hidden");
    };

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
          onShow: () => {
            // MODIFICATION: Show backdrop when tippy is shown
            showBackdrop();
          },
          onHide: () => {
            // MODIFICATION: Hide backdrop when tippy is hidden
            hideBackdrop();
          },
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
        // MODIFICATION: Ensure backdrop is removed on final exit
        hideBackdrop();
      },
    };
  },
});
