import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./router/MainRouter";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./graphql/client";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apolloClient}>
    <StrictMode>
      <Router />
    </StrictMode>
  </ApolloProvider>
);
