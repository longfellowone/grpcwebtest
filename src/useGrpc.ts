import { useReducer, useRef, useEffect } from 'react';
import * as jspb from 'google-protobuf';

// For streaming...
// const call = client.sayHello(request, {}, () => {});
// call.on('data', data => console.log(data.toObject()));

type GrpcRequestFn<T extends jspb.Message> = (name: string) => Promise<T>;

type MakeRequestFn = <T extends jspb.Message>(
  request: GrpcRequestFn<T>,
  variables: any,
  optimistic: any,
) => Promise<void>;

export function useGrpc(initialData: any): [any, any, any, MakeRequestFn] {
  const [state, dispatch] = useReducer(requestReducer, {
    isLoading: true,
    isError: false,
    data: initialData,
  });
  const mounted = useRef(true);

  // const call = client.sayHello(request, {}, () => {});
  // call.on('data', data => console.log(data.toObject()));

  async function makeRequest<T extends jspb.Message>(
    request: GrpcRequestFn<T>,
    variables: any,
    optimistic: any,
  ): Promise<void> {
    if (!optimistic) {
      dispatch({ type: 'REQUEST_START' });
    } else {
      dispatch({ type: 'OPTIMISTIC_REQUEST_START', payload: optimistic({ ...state.data }) });
    }

    try {
      const response = await request(variables);
      if (!mounted.current) return;
      dispatch({ type: 'REQUEST_SUCCESS', payload: response.toObject() });
    } catch (error) {
      if (!mounted.current) return;
      if (!optimistic) {
        dispatch({ type: 'REQUEST_ERROR', payload: error });
      } else {
        dispatch({ type: 'OPTIMISTIC_REQUEST_ERROR', payload: { error: error, data: state.data } });
      }
    }
  }

  useEffect((): any => {
    return () => (mounted.current = false);
  }, []);

  return [state.data, state.isError, state.isLoading, makeRequest];
}

const requestReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'REQUEST_START':
      return {
        ...state,
        isLoading: true,
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
        isError: action.payload,
      };
    case 'OPTIMISTIC_REQUEST_START':
      return {
        ...state,
        data: action.payload,
      };
    case 'OPTIMISTIC_REQUEST_ERROR':
      return {
        ...state,
        isLoading: false,
        isError: action.payload.error,
        data: action.payload.data,
      };
    default:
      return state;
  }
};
