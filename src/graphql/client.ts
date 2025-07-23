import { ApolloClient, ApolloLink, InMemoryCache, split } from "@apollo/client";
import { graphqlEndpoint } from "../db/config";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
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
  wsLink, // directs traffic to this link if the function returns true
  httpLinkChain // directs traffic to this link if the function returns false
);

export const apolloClient = new ApolloClient({
  link: splitLink, // Use the new split link
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
