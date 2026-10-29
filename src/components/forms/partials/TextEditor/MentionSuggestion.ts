// src/components/forms/partials/TextEditor/MentionSuggestion.ts
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance, type Props } from "tippy.js";
import MentionList, { type MentionListRef } from "./MentionList";

export type MentionTier = "case" | "other";

export interface MentionUser {
  _id: string;
  name: string;
  username: string;
  position?: string;
  /** "case": already sees the case; "other": gets guest access when mentioned */
  tier?: MentionTier;
  /** Categories of the user missing from the case — adding one gives them
   *  regular access instead of a guest grant */
  fixCategories?: { _id: string; name: string }[];
}

/** Page-level behaviour of the confirmation step for "other"-tier users and
 *  of the empty state (see MentionGuestContext). */
export interface MentionGuestOptions {
  /** Adds the category to the case/form; the mention is inserted afterwards */
  onAddCategory?: (categoryId: string) => void | Promise<void>;
  /** Verb of the add-category action, e.g. "Добави категория" */
  addCategoryLabel?: string;
  /** Explanation shown when no suggestion matches the query */
  emptyHint?: string;
}

type Source<T> = T | (() => T);
const resolve = <T,>(source: Source<T>): T =>
  typeof source === "function" ? (source as () => T)() : source;

const TIER_ORDER: Record<MentionTier, number> = { case: 0, other: 1 };

// The suggestion plugin exits when the user clicks outside the editor and
// re-activates on the next state update while the trigger text is still at
// the cursor — so the popup is only shown while the editor has focus.
const editorHasFocus = (props: {
  editor?: { view?: { hasFocus?: () => boolean } };
}): boolean => props.editor?.view?.hasFocus?.() ?? true;

/**
 * Mention suggestion config for TipTap. `mentions` and `guestOptions` may be
 * getters so an editor created once keeps seeing the latest values.
 */
export const createMentionSuggestion = (
  mentions: Source<MentionUser[]> = [],
  guestOptions?: Source<MentionGuestOptions | undefined>,
) => {
  let currentQuery = "";
  // the query the user dismissed with Escape stays hidden until it changes
  let dismissedQuery: string | null = null;
  const isDismissed = () =>
    dismissedQuery !== null && dismissedQuery === currentQuery;

  return {
    items: async ({ query }: { query: string }): Promise<MentionUser[]> => {
      const needle = query.toLowerCase();
      return (resolve(mentions) || [])
        .filter(
          (user) =>
            user.name.toLowerCase().includes(needle) ||
            user.username.toLowerCase().includes(needle),
        )
        .sort(
          (a, b) =>
            TIER_ORDER[a.tier ?? "case"] - TIER_ORDER[b.tier ?? "case"] ||
            a.name.localeCompare(b.name, "bg"),
        );
    },
    allowedPrefixes: [" ", " "],

    render: () => {
      let component: ReactRenderer<MentionListRef>;
      let popup: Instance<Props>[];
      const withOptions = (props: Record<string, unknown>) => ({
        ...props,
        guestOptions: resolve(guestOptions),
      });

      return {
        onStart: (props: any) => {
          currentQuery = props.query ?? "";
          component = new ReactRenderer(MentionList, {
            props: withOptions(props),
            editor: props.editor,
          });

          if (!props.clientRect) return;

          // Mounted on <body> so no modal's overflow clips it. The list is a
          // React portal inside the editor's tree, so Radix dialogs still
          // treat clicks in it as inside; their modal mode sets
          // `pointer-events: none` on <body>, hence the explicit override.
          popup = tippy("body", {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: editorHasFocus(props) && !isDismissed(),
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
            zIndex: 9999,
          });
          // on the content element: tippy rewrites the popper's own
          // pointer-events on every show
          const content = component.element as HTMLElement;
          content.style.pointerEvents = "auto";
          // Radix's scroll lock cancels wheel/touch scrolling that reaches
          // `document` from outside the dialog's DOM, which <body> is
          const keepScrollLocal = (event: Event) => event.stopPropagation();
          content.addEventListener("wheel", keepScrollLocal, { passive: true });
          content.addEventListener("touchmove", keepScrollLocal, {
            passive: true,
          });

          // TipTap's focus() command refocuses on the next animation frame,
          // so a session started together with it begins hidden
          if (!popup[0].state.isVisible && !isDismissed()) {
            requestAnimationFrame(() => {
              const instance = popup?.[0];
              if (
                instance &&
                !instance.state.isDestroyed &&
                !instance.state.isVisible &&
                editorHasFocus(props) &&
                !isDismissed()
              ) {
                instance.show();
              }
            });
          }
        },

        onUpdate: (props: any) => {
          currentQuery = props.query ?? "";
          component.updateProps(withOptions(props));
          if (!props.clientRect) return;
          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
          if (dismissedQuery !== null && !isDismissed()) dismissedQuery = null;
          const shouldShow = editorHasFocus(props) && !isDismissed();
          if (shouldShow && !popup[0].state.isVisible) popup[0].show();
          if (!shouldShow && popup[0].state.isVisible) popup[0].hide();
        },

        onKeyDown: (props: { event: KeyboardEvent }): boolean => {
          // a hidden popup must not swallow Enter/arrows for the editor
          if (!popup?.[0]?.state.isVisible) return false;
          // the list handles Escape itself while its confirmation step is open
          if (component.ref?.onKeyDown(props)) return true;
          if (props.event.key === "Escape") {
            dismissedQuery = currentQuery;
            popup[0].hide();
            return true;
          }
          return false;
        },

        onExit: () => {
          popup[0].destroy();
          component.destroy();
        },
      };
    },
  };
};
