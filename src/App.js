import React, { useEffect, useState, useRef, useReducer } from 'react';
import { GreeterPromiseClient } from './helloworld_grpc_web_pb';
import { HelloRequest } from './helloworld_pb';

const client = new GreeterPromiseClient('http://localhost:8080');

const newHelloRequest = async ({ name }) => {
  console.log('started');
  const request = new HelloRequest();
  request.setName(name);

  const response = await client.sayHello(request, {});
  return response.getMessage();
};

const App = () => {
  const [input, setInput] = useState('world');
  const [data, refetch] = useGrpcRequest(newHelloRequest, { name: 'init' }, []);

  const handleClick = () => {
    refetch({ name: input });
  };

  return (
    <div>
      <div>{data}</div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleClick}>New Request</button>
    </div>
  );
};

export default App;

const useGrpcRequest = (request, variables, initialData) => {
  const [state, dispatch] = useReducer(requestReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  const mounted = useRef(true);

  const makeRequest = async newVariables => {
    dispatch({ type: 'REQUEST_START' });

    const params = {
      ...variables,
      ...newVariables,
    };

    try {
      const response = await request(params);
      if (!mounted.current) return;
      dispatch({ type: 'REQUEST_SUCCESS', payload: response });
    } catch (error) {
      console.log('error: ', error);
      if (!mounted.current) return;
      dispatch({ type: 'REQUEST_ERROR' });
    }
  };

  useEffect(() => {
    makeRequest();
    return () => (mounted.current = false);
  }, []);

  return [state.data, makeRequest];
};

const requestReducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST_START':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'REQUEST_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'REQUEST_ERROR':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};
