import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./i18n"; // Import the i18n configuration
import "./index.css"; // Your global styles
import Router from "./router/MainRouter";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./graphql/client";
import LoadingModal from "./components/modals/LoadingModal";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apolloClient}>
    <StrictMode>
      <Suspense
        fallback={LoadingModal({
          isOpen: true,
          message: "Loading translations...",
        })}
      >
        <Router />
      </Suspense>
    </StrictMode>
  </ApolloProvider>
);
