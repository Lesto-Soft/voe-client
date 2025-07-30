// src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import "./index.css";
// import Router from "./router/MainRouter"; // <- Вече не импортираме Router директно
import App from "./App"; // <-- Импортираме новия App компонент
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./graphql/client";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apolloClient}>
    <StrictMode>
      <ToastContainer />
      <App /> {/* <-- Използваме App вместо Router */}
    </StrictMode>
  </ApolloProvider>
);
