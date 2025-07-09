import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { dev_graphqlEndpoint } from "../db/config";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { onError } from "@apollo/client/link/error";

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

const uploadLink = createUploadLink({
  uri: dev_graphqlEndpoint,
  credentials: "include",
  headers: {
    "apollo-require-preflight": "true",
  },
});

const link = ApolloLink.from([errorLink, uploadLink]);

export const apolloClient = new ApolloClient({
  link: link,
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
