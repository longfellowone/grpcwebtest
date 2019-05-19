import React, { useState, useContext, useEffect } from 'react';

import { useGrpc } from './useGrpc';
import { HelloRequest, HelloReply } from './helloworld_pb';
import { ClientContext } from './index';

const App: React.FC = () => {
  const [input, setInput] = useState('world!!!!!!!!!!');
  const client = useContext(ClientContext); // Pull client from context

  const newHelloRequest = async (name: string): Promise<HelloReply> => {
    const request = new HelloRequest();
    request.setName(name);

    return await client.sayHello(request, {});
  };

  const [data, error, loading, makeRequest] = useGrpc<HelloReply>(null);

  const fetchDates = () => makeRequest(newHelloRequest, 'World!', null);

  useEffect(() => {
    fetchDates();
  }, []);

  const handleClick = () =>
    makeRequest(
      newHelloRequest,
      input,
      (data: HelloReply.AsObject): HelloReply.AsObject => {
        data.message = 'Hello ' + input;
        return data;
      },
    );

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
      <div>{loading ? <div>loading...</div> : data.getMessage()}</div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleClick}>New Request</button>
    </div>
  );
};

export default App;
