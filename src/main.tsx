import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./i18n"; // Import the i18n configuration
import "./index.css"; // Your global styles
import Router from "./router/MainRouter";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./graphql/client";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apolloClient}>
    <StrictMode>
      <ToastContainer />
      <Router />
    </StrictMode>
  </ApolloProvider>
);
