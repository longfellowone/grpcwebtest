import React, { useState, useContext } from 'react';

import { useGrpcRequest } from './useGrpcHook';
import { HelloRequest } from './helloworld_pb';
import { ClientContext } from './index';

const App = () => {
  const [input, setInput] = useState('world!!!!!!!!!!');
  const client = useContext(ClientContext); // Pull client from context

  const newHelloRequest = async ({ name }) => {
    const request = new HelloRequest();
    request.setName(name);

    return await client.sayHello(request, {});
  };

  const [data, error, loading, refetch] = useGrpcRequest(newHelloRequest, { name: 'world' }, []);

  const handleClick = () => refetch({ name: input });

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
