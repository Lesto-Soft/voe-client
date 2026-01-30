// src/graphql/client.ts
import { ApolloClient, ApolloLink, InMemoryCache, split } from "@apollo/client";
import { graphqlEndpoint } from "../db/config";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

export const AUTH_ERROR_EVENT = "auth-error";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      const isAuthError =
        extensions?.code === "UNAUTHENTICATED" ||
        (message.includes("Cannot read properties of undefined") &&
          path?.[0] === "me");

      if (isAuthError) {
        console.log("Authentication error detected, dispatching global event.");
        window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT));
      }
    });
  }
  if (networkError) {
    window.location.href = "/server-error";
  }
});

const httpLink = createUploadLink({
  uri: graphqlEndpoint,
  credentials: "include",
  headers: {
    "apollo-require-preflight": "true",
  },
});

const httpLinkChain = ApolloLink.from([errorLink, httpLink]);
const wsClient = createClient({
  url: graphqlEndpoint.replace(/^http/, "ws"),
});
const wsLink = new GraphQLWsLink(wsClient);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLinkChain
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
    },
    query: {
      fetchPolicy: "network-only",
    },
  },
});
