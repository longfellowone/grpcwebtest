import { useReducer, useRef, useEffect } from 'react';

// Hook for gRPC queries
export const useGrpc = initialData => {
  const [state, dispatch] = useReducer(requestReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  const mounted = useRef(true);

  const makeRequest = async (request, variables) => {
    dispatch({ type: 'REQUEST_START' });

    try {
      const response = await request(variables);
      if (!mounted.current) return;
      dispatch({ type: 'REQUEST_SUCCESS', payload: response.toObject() });
    } catch (error) {
      if (!mounted.current) return;
      dispatch({ type: 'REQUEST_ERROR', payload: error });
    }
  };

  useEffect(() => {
    return () => (mounted.current = false);
  }, []);

  return [state.data, state.isError, state.isLoading, makeRequest];
};

// Hook for gRPC queries
export const useGrpcOld = (initialRequest, initialVariables, initialData) => {
  const [state, dispatch] = useReducer(requestReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  const mounted = useRef(true);

  const makeRequest = async (newRequest, newVariables) => {
    !newRequest && dispatch({ type: 'REQUEST_START' });

    const params = {
      ...initialVariables,
      ...newVariables,
    };

    try {
      const response = newRequest ? await newRequest(params) : await initialRequest(params);
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
