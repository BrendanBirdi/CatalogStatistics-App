import axios from 'axios';

/**
 * Create an Axios Client with defaults
 */
const defaultClient = axios.create({
  baseURL: '',
  withCredentials: true,
});


/**
 * Create cancellable request helper wrappers for axios
 * functions
 */
const createCancelSource = () => {
  return axios.CancelToken.source();
};

const isCancel = error => (
  axios.isCancel(error)
);

/**
 * Request Wrapper with default success/error actions
 */
const request = (options, baseUrl, fullResponse) => {
  let dynamicClient;
  if (baseUrl) {
    dynamicClient = axios.create({
      baseURL: baseUrl,
    });
  }

  const onSuccess = (response) => {
    console.debug('Request Successful!', response);
    if (fullResponse) {
      return response;
    }
    return response.data;
  };

  const onError = (error) => {
    if (isCancel(error)) {
      return Promise.reject(error);
    }

    console.error('Request Failed:', error.config);

    if (error.response) {
      // Request was made but server responded with something
      // other than 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      // Something else happened while setting up the request
      // triggered the error
      console.error('Error Message:', error.message);
    }

    return Promise.reject(error.response || error.message);
  };

  const requestClient = (dynamicClient !== undefined) ? dynamicClient : defaultClient;

  return requestClient(options)
    .then(onSuccess)
    .catch(onError);
};

export {
  request,
  createCancelSource,
  isCancel,
};
