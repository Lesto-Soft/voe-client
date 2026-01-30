// src/components/auth/AuthModal.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { useAuthModal } from "../../context/AuthModalContext";
import LoginForm from "./LoginForm";

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, onSuccess } = useAuthModal();

  const handleLoginSuccess = () => {
    onSuccess();
    closeAuthModal();
  };

  return (
    <Dialog.Root open={isAuthModalOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 backdrop-blur-sm data-[state=open]:animate-overlayShow fixed inset-0 z-40" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg z-50 w-[90vw] max-w-md focus:outline-none">
          {/* Visually hidden title and description for accessibility */}
          <Dialog.Title className="sr-only">Session Expired</Dialog.Title>
          <Dialog.Description className="sr-only">
            Please log in again to continue to the requested page.
          </Dialog.Description>
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AuthModal;
