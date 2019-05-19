import { useReducer, useRef, useEffect } from 'react';
import * as jspb from 'google-protobuf';

// For streaming...
// const call = client.sayHello(request, {}, () => {});
// call.on('data', data => console.log(data.toObject()));

type GrpcRequestFn<T> = (name: string) => Promise<T>;

type OptimisticResponseFn<U> = (data: U) => U;

type MakeRequestFn<T> = (
  request: GrpcRequestFn<T>,
  variables: any,
  optimistic: any,
) => Promise<void>;

export function useGrpc<T extends jspb.Message>(initialData: any): [T, any, any, MakeRequestFn<T>] {
  const [state, dispatch] = useReducer(requestReducer, {
    isLoading: true,
    isError: false,
    data: initialData,
  });
  const mounted = useRef(true);

  async function makeRequest(
    request: GrpcRequestFn<T>,
    variables: any,
    optimistic: OptimisticResponseFn<T>,
  ): Promise<void> {
    if (!optimistic) {
      dispatch({ type: 'REQUEST_START' });
    } else {
      dispatch({ type: 'OPTIMISTIC_REQUEST_START', payload: optimistic({ ...state.data }) });
    }

    try {
      const response = await request(variables);
      console.log(response.toObject());
      if (!mounted.current) return;
      dispatch({ type: 'REQUEST_SUCCESS', payload: response });
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
