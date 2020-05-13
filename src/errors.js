const errors = {
  notUrl: 'notUrl',
  notRss: 'notRss',
  alreadyAdded: 'alreadyAdded',
  'Network Error': 'networkError',
  'Request failed with status code 429': 'tooManyRequests',
  'timeout of 7000ms exceeded': 'timeoutError',
};

export default ({ message }) => (errors[message] || 'unknownError');
