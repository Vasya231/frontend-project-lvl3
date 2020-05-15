import settings from './settings';

const errors = {
  notUrl: 'notUrl',
  notRss: 'notRss',
  alreadyAdded: 'alreadyAdded',
  'Network Error': 'networkError',
  'Request failed with status code 429': 'tooManyRequests',
};

errors[`timeout of ${settings.responseTimeout}ms exceeded`] = 'timeoutError';

export default ({ message }) => (errors[message] || 'unknownError');
