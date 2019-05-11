import React, { useState, useEffect, useContext } from 'react';

import { useGrpc } from './useGrpcHook';
import { HelloRequest } from './helloworld_pb';
import { ClientContext } from './index';

const App = () => {
  const client = useContext(ClientContext); // Pull client from context

  // Initial request
  const newHelloRequest = async ({ name }) => {
    const request = new HelloRequest();
    request.setName(name);

    console.log('newHelloRequest');

    return await client.sayHello(request, {});
  };

  // Update request
  const newUpdateRequest = async ({ name }) => {
    const request = new HelloRequest();
    request.setName(name);

    console.log('newUpdateRequest');

    return await client.sayHello(request, {});
  };

  // makeRequest func must return same response object as initial request
  const [data, error, loading, makeRequest] = useGrpc('');
  const [input, setInput] = useState('world!!!');

  useEffect(() => makeRequest(newHelloRequest, { name: 'world' }), []);

  const handleClick = () => makeRequest(newUpdateRequest, { name: input });

  if (error) {
    return (
      <div>
        {loading ? <div>Retrying...</div> : <div>Error: {error.message}</div>}
        <button onClick={handleClick}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div>{loading ? <div>loading...</div> : data.message}</div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleClick}>New Request</button>
    </div>
  );
};

export default App;
