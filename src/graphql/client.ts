import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { dev_endpoint, dev_graphqlEndpoint } from "../db/config";

const httpLink = createHttpLink({
  uri: dev_graphqlEndpoint,
  credentials: "include",
});

export const apolloClient = new ApolloClient({
  link: httpLink,
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
