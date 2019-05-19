import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { GreeterPromiseClient } from './helloworld_grpc_web_pb';

// https://github.com/grpc/grpc-web/issues/484
// Use the Promise client, not the standard GreeterClient
const client = new GreeterPromiseClient('http://localhost:8080', null, null);

export const ClientContext = React.createContext<GreeterPromiseClient>(client); // Provide gRPC client in context

ReactDOM.render(
  <ClientContext.Provider value={client}>
    <App />
  </ClientContext.Provider>,
  document.getElementById('root'),
);
