import { useReducer, useRef, useEffect } from 'react';

// For streaming...
// const call = client.sayHello(request, {}, () => {});
// call.on('data', data => console.log(data.toObject()));

export const useGrpc = initialData => {
  const [state, dispatch] = useReducer(requestReducer, {
    isLoading: true,
    isError: false,
    data: initialData,
  });
  const mounted = useRef(true);

  const makeRequest = async (request, variables, optimistic) => {
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
  };

  useEffect(() => {
    return () => (mounted.current = false);
  }, []);

  return [state.data, state.isError, state.isLoading, makeRequest];
};

const requestReducer = (state, action) => {
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
