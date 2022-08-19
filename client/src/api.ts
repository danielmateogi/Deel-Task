/** We return a function so we don't need to pass a callback in useQuery */
export const fetchApi = (route: string, body?: Record<string, unknown>) => async () => {
  const isPost = body !== undefined;
  const response = await fetch(`${process.env.REACT_APP_API_URL}${route}`, {
    headers: {
      profile_id: localStorage.getItem('profileId') ?? '1',
      'Content-Type': 'application/json',
    },
    method: isPost ? 'POST' : 'GET',
    body: isPost ? JSON.stringify(body) : undefined,
  });
  /** If it's not an error returned by the API specifially we show a generic message */
  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const jsonResponse = await response.json();
      errorMessage = jsonResponse.error;
    } finally {
      throw new Error(errorMessage);
    }
  }
  return response.json();
};

export interface DepositQueryFunctionParams {
  profileId: number;
  amount: number;
}

export const depositMutationFunction = ({ profileId, amount }: DepositQueryFunctionParams) => {
  return fetchApi(`/balances/deposit/${profileId}`, {
    amount,
  })();
};

export const paymentMutationFunction = ({ jobId }: { jobId: number }) => {
  /** We pass an empty object so that POST is used in the api call */
  return fetchApi(`/jobs/${jobId}/pay`, {})();
};
