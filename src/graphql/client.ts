import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { dev_endpoint, dev_graphqlEndpoint } from "../db/config";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const uploadLink = createUploadLink({
  uri: dev_graphqlEndpoint,
  credentials: "include",
  headers: {
    "apollo-require-preflight": "true",
  },
});

export const apolloClient = new ApolloClient({
  link: uploadLink,
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
