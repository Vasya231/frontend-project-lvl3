import settings from './settings';

const errors = {
  notUrl: 'notUrl',
  notRss: 'notRss',
  alreadyAdded: 'alreadyAdded',
  'Network Error': 'networkError',
  'Request failed with status code 429': 'code429',
  'Request failed with status code 503': 'code503',
  'Request failed with status code 404': 'code404',
};

errors[`timeout of ${settings.responseTimeout}ms exceeded`] = 'timeoutError';

export default ({ message }) => (errors[message] || 'unknownError');
