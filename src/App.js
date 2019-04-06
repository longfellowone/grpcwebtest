import React, { useState } from 'react';
import { GreeterPromiseClient } from './helloworld_grpc_web_pb';
import { HelloRequest } from './helloworld_pb';

const client = new GreeterPromiseClient('http://localhost:8080');

const App = () => {
  const [state, setState] = useState('Click to make a new request');

  const newHelloRequest = async () => {
    setState('loading...');

    const request = new HelloRequest();
    request.setName('World');

    const response = await client.sayHello(request, {});
    setState(response.getMessage());
  };

  return (
    <div>
      <div>{state}</div>
      <button onClick={newHelloRequest}>New Request</button>
    </div>
  );
};

export default App;
