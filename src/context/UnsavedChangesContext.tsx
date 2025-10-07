// src/context/UnsavedChangesContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { useBlocker } from "react-router";
import ConfirmActionDialog from "../components/modals/ConfirmActionDialog";
import { useTranslation } from "react-i18next";

interface UnsavedChangesContextType {
  addDirtySource: (id: string) => void;
  removeDirtySource: (id: string) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(
  null
);

export const useUnsavedChanges = () => {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error(
      "useUnsavedChanges must be used within an UnsavedChangesProvider"
    );
  }
  return context;
};

export const UnsavedChangesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { t } = useTranslation("modals");
  const [dirtySources, setDirtySources] = useState<Set<string>>(new Set());

  const hasUnsavedChanges = dirtySources.size > 0;

  // This hook handles in-app navigation (e.g., clicking a <Link>)
  const blocker = useBlocker(hasUnsavedChanges);

  // this useEffect to handle browser-level events
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Standard way to trigger the browser's native confirmation dialog
      event.preventDefault();
      event.returnValue = ""; // Required for most browsers
    };

    if (hasUnsavedChanges) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    // Cleanup function removes the listener when the component unmounts
    // or when hasUnsavedChanges becomes false.
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]); // Re-runs when the dirty state changes

  const addDirtySource = useCallback((id: string) => {
    setDirtySources((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  }, []);

  const removeDirtySource = useCallback((id: string) => {
    setDirtySources((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const handleConfirmNavigation = () => {
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  };

  const handleCancelNavigation = () => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  const value = { addDirtySource, removeDirtySource };

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      <ConfirmActionDialog
        isOpen={blocker.state === "blocked"}
        onOpenChange={(open) => !open && handleCancelNavigation()}
        onConfirm={handleConfirmNavigation}
        title={t("unsavedChangesTitle", "Незапазени промени")}
        description={t(
          "unsavedChangesNavDescription",
          "Имате незапазени промени. Сигурни ли сте, че искате да напуснете страницата?"
        )}
        confirmButtonText={t("leavePage", "Напускане")}
        isDestructiveAction={true}
      />
    </UnsavedChangesContext.Provider>
  );
};
