// src/context/MentionGuestContext.tsx
import { createContext, useContext } from "react";
import type { MentionGuestOptions } from "../components/forms/partials/TextEditor/MentionSuggestion";

/**
 * Page-level behaviour of the mention dropdown's guest confirmation step
 * (the "add category instead" action and the empty-state hint). Pages wrap
 * their editors in `MentionGuestContext.Provider`; editors read it from here,
 * so it doesn't have to be threaded through every comment and answer
 * component the way the mention list itself is.
 */
export const MentionGuestContext = createContext<
  MentionGuestOptions | undefined
>(undefined);

export const useMentionGuestOptions = (): MentionGuestOptions | undefined =>
  useContext(MentionGuestContext);
