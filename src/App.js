import React from "react";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
  ApolloProvider,
  useQuery,
  gql,
  useSubscription,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// for query
// const GET_RAW_EVENTS = gql`
//   query GetRawEvents {
//     raw_events(order_by: { block_number: desc }, limit: 10) {
//       block_number
//     }
//   }
// `;

// for subscription
const GET_RAW_EVENTS = gql`
  subscription GetRawEvents {
    raw_events(order_by: { block_number: desc }, limit: 10) {
      block_number
    }
  }
`;

// indexer commit with lots of real time events: a0dfe85
// queries use vanilla http
const httpLink = new HttpLink({
  uri: "https://indexer.bigdevenergy.link/4b245b5/v1/graphql",
});

// subscriptions use websockets
const wsLink = new GraphQLWsLink(
  createClient({
    url: "wss://indexer.bigdevenergy.link/4b245b5/v1/graphql",
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

function SubComponent() {
  // const { loading, error, data } = useQuery(GET_RAW_EVENTS);
  const { loading, error, data } = useSubscription(GET_RAW_EVENTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;
  if (data) {
    console.log("data");
    console.log(data);
  }

  return (
    <div>
      <h1>SubComponent</h1>
      {data.raw_events.map((event) => {
        return event.block_number + "   ";
      })}
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <SubComponent />
      <div className="flex flex-col h-full items-center justify-center bg-gray-200 text-gray-700">
        <div className="flex items-center">
          <h1 className="text-6xl font-thin tracking-wider">
            Create React App + Tailwind CSS
          </h1>
        </div>
        <p className="my-6 tracking-wide">
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <div className="mt-6 flex justify-center">
          <a
            className="uppercase hover:underline"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <a
            className="ml-10 uppercase hover:underline"
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn Tailwind
          </a>
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;
