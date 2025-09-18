// src/context/AuthModalContext.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

interface AuthModalContextType {
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccessCallback: () => void) => void;
  closeAuthModal: () => void;
  onSuccess: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [onSuccess, setOnSuccess] = useState<() => void>(() => () => {});

  const openAuthModal = useCallback((onSuccessCallback: () => void) => {
    setOnSuccess(() => onSuccessCallback);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const value = { isAuthModalOpen, openAuthModal, closeAuthModal, onSuccess };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};
