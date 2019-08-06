import { useEffect, useReducer } from 'react';

function resolvePromise(promise) {
  if (typeof promise === 'function') {
    return promise();
  }

  return promise;
}

function thenable(promise) {
  return !!promise && typeof promise.then === 'function';
}

const states = {
  pending: 'pending',
  rejected: 'rejected',
  resolved: 'resolved'
};

function reducer(state, action) {
  switch (action.type) {
    case states.pending:
      return {
        error: undefined,
        result: state.result,
        state: states.pending
      };

    case states.resolved:
      return {
        error: undefined,
        result: action.payload,
        state: states.resolved
      };

    case states.rejected:
      return {
        error: action.payload,
        result: undefined,
        state: states.rejected
      };

    /* istanbul ignore next */
    default:
      return state;
  }
}

function usePromise(promise, inputs) {
  const [{ error, result, state }, dispatch] = useReducer(reducer, {
    error: undefined,
    result: undefined,
    state: states.pending
  });

  useEffect(() => {
    promise = resolvePromise(promise);

    if (!thenable(promise)) {
      // If not promise, set state to resolved
      dispatch({ payload: promise, type: states.resolved });

      return;
    }

    let canceled = false;

    dispatch({ type: states.pending });

    promise.then(
      result => !canceled && dispatch({
        payload: result,
        type: states.resolved
      }),
      error => !canceled && dispatch({
        payload: error,
        type: states.rejected
      })
    );

    return () => {
      canceled = true;
    };
  }, inputs);

  return [result, error, state];
}

export default usePromise;
