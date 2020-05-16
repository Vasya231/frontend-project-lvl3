import axios from 'axios';
import { parseRss, isValidUrl, proxifyUrl } from './utils';
import getErrorType from './errors';
import settings from './settings';

const loadRss = (rssLink) => axios
  .get(proxifyUrl(rssLink), { timeout: settings.responseTimeout })
  .then((response) => {
    const isRss = response.headers['content-type'].includes('application/rss+xml');
    if (!isRss) {
      throw new Error('notRss');
    }
    const parsedObj = parseRss(response.data);
    return Promise.resolve(parsedObj);
  });

const updateFeeds = (state) => {
  const feeds = state.getFeeds();
  const updatePromises = feeds.map(({ id, link }) => {
    const promise = loadRss(link).then((parsedRss) => {
      const {
        title, description, itemList,
      } = parsedRss;
      state.updateFeed(id, link, title, description, itemList);
    });
    return (promise.catch((e) => {
      console.log(`ERROR while updating feed ${link}:`, e);
    }));
  });
  return Promise.all(updatePromises);
};

const restartTimer = (state) => {
  setTimeout(() => updateFeeds(state).then(() => restartTimer(state)), settings.refreshTimeout);
};

const generateSubmitHandler = (state) => (event) => {
  event.preventDefault();
  const formValue = state.getFormValue();
  if (!isValidUrl(formValue)) {
    state.setFormError('notUrl');
    return;
  }
  const rssLink = new URL(formValue).href;
  const feeds = state.getFeeds();
  if (feeds.findIndex(({ link }) => (link === rssLink)) !== -1) {
    state.setFormError('alreadyAdded');
    return;
  }
  state.setFormState('sending');
  loadRss(rssLink)
    .then((parsedRss) => {
      const {
        title, description, itemList,
      } = parsedRss;
      state.addFeed(rssLink, title, description, itemList);
      state.setFormValue('');
      state.setFormError('');
      state.setFormState('filling');
      state.setFormValidity(true);
    })
    .catch((error) => {
      state.setFormState('filling');
      const errorType = getErrorType(error);
      state.setFormError(errorType);
      if (errorType === 'unknownError') {
        console.log('Unexpected error occured:');
        console.log(error);
      }
    });
};

const generateInputHandler = (state) => (event) => {
  event.preventDefault();
  const { value } = event.target;
  state.setFormValue(value);
  state.setFormValidity(isValidUrl(value) || (value === ''));
};

export { restartTimer, generateInputHandler, generateSubmitHandler };
