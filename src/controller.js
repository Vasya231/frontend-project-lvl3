import axios from 'axios';
import { uniqueId } from 'lodash';
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

const addItemToFeed = (state, feedId, {
  title, description, link, pubDate,
}) => {
  const dateAdded = pubDate || Date.now();
  state.posts.push({
    feedId, title, description, link, dateAdded,
  });
};

const updateFeed = (state, feedId, link, title, description, items) => {
  const feed = state.feeds.find(({ id }) => (feedId === id));
  feed.link = link;
  feed.title = title;
  feed.description = description;
  const oldItems = state.posts.filter(({ feedId: currentFeedId }) => (feedId === currentFeedId));
  const feedHasItem = (item) => (
    oldItems.findIndex(({ link: currentLink }) => (currentLink === item.link)) !== -1
  );
  const newItems = items.filter((item) => !(feedHasItem(item)));
  newItems.forEach((item) => addItemToFeed(state, feedId, item));
};

const updateFeeds = (state) => {
  const { feeds } = state;
  const updatePromises = feeds.map(({ id, link }) => {
    const promise = loadRss(link).then((parsedRss) => {
      const {
        title, description, items,
      } = parsedRss;
      updateFeed(state, id, link, title, description, items);
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
  const formValue = state.form.value;
  if (!isValidUrl(formValue)) {
    state.form.error = 'notUrl';
    return;
  }
  const rssLink = new URL(formValue).href;
  const { feeds } = state;
  if (feeds.findIndex(({ link }) => (link === rssLink)) !== -1) {
    state.form.error = 'alreadyAdded';
    return;
  }
  state.form.processState = 'sending';
  loadRss(rssLink)
    .then((parsedRss) => {
      const {
        title, description, items,
      } = parsedRss;
      const id = uniqueId();
      const newFeed = {
        id, link: rssLink, title, description, items: [],
      };
      state.feeds.push(newFeed);
      items.forEach((item) => addItemToFeed(state, id, item));
      state.form.value = '';
      state.form.error = '';
      state.form.processState = 'filling';
      state.form.valid = true;
    })
    .catch((error) => {
      state.form.processState = 'filling';
      const errorType = getErrorType(error);
      state.form.error = errorType;
      if (errorType === 'unknownError') {
        console.log('Unexpected error occured:');
        console.log(error);
      }
    });
};

const generateInputHandler = (state) => (event) => {
  event.preventDefault();
  const form = event.target.closest('form.rss-form');
  const formData = new FormData(form);
  const value = formData.get('url');
  state.form.value = value;
  state.form.valid = isValidUrl(value) || (value === '');
};

export { restartTimer, generateInputHandler, generateSubmitHandler };
