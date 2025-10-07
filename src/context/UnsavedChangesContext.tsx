// src/context/UnsavedChangesContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
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

  // useBlocker will block navigation if hasUnsavedChanges is true
  const blocker = useBlocker(hasUnsavedChanges);

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
