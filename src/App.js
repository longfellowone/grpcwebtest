import React, { useState, useContext, useEffect } from 'react';

import { useGrpc } from './useGrpcHook';
import { HelloRequest } from './helloworld_pb';
import { ClientContext } from './index';

const App = () => {
  const [input, setInput] = useState('world!!!!!!!!!!');
  const client = useContext(ClientContext); // Pull client from context

  const newHelloRequest = async ({ name }) => {
    const request = new HelloRequest();
    request.setName(name);

    // const call = client.sayHello(request, {}, () => {});
    // call.on('data', data => console.log(data.toObject()));

    return await client.sayHello(request, {});
  };

  const [data, error, loading, makeRequest] = useGrpc(null);

  const fetchDates = () => makeRequest(newHelloRequest, { name: 'World!' });

  useEffect(() => {
    fetchDates();
  }, []);

  const handleClick = () =>
    makeRequest(newHelloRequest, { name: input }, data => {
      data.message = 'Hello ' + input;
      return data;
    });

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
