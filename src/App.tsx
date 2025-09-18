// src/App.tsx
import React, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { mainRouter } from "./router/MainRouter";
import EnvironmentLabel from "./components/global/EnvironmentLabel";

// --- NEW IMPORTS ---
import { AuthModalProvider, useAuthModal } from "./context/AuthModalContext";
import AuthModal from "./components/auth/AuthModal";
import { AUTH_ERROR_EVENT, apolloClient } from "./graphql/client";

// This new component listens for the global auth event and triggers the modal.
const AuthEventHandler: React.FC = () => {
  const { openAuthModal, isAuthModalOpen } = useAuthModal();

  useEffect(() => {
    const handleAuthError = () => {
      // Only open the modal if it's not already open to avoid duplicates
      if (!isAuthModalOpen) {
        openAuthModal(() => {
          // On successful login, reset the Apollo cache to refetch all active queries
          apolloClient.resetStore();
        });
      }
    };

    window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);
    return () => {
      window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError);
    };
  }, [openAuthModal, isAuthModalOpen]);

  return null; // This component does not render anything visible
};

const App: React.FC = () => {
  return (
    <AuthModalProvider>
      <EnvironmentLabel />
      {/* AuthEventHandler and AuthModal are now inside the provider */}
      <AuthEventHandler />
      <AuthModal />
      <RouterProvider router={mainRouter} />
    </AuthModalProvider>
  );
};

export default App;
