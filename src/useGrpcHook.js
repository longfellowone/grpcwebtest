import { useReducer, useRef, useEffect } from 'react';

// Hook for gRPC queries
export const useGrpcRequest = (request, variables, initialData) => {
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
      dispatch({ type: 'REQUEST_SUCCESS', payload: response.toObject() });
    } catch (error) {
      if (!mounted.current) return;
      dispatch({ type: 'REQUEST_ERROR', payload: error });
    }
  };

  useEffect(() => {
    makeRequest();
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
    default:
      throw new Error();
  }
};
