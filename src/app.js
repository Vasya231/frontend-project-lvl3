import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import { uniqueId } from 'lodash';
import texts from './locales';
import initWatchers from './view';
import { parseRss, proxifyUrl } from './utils';
import getErrorType from './errors';
import settings from './settings';

const loadRss = (rssLink) => axios
  .get(proxifyUrl(rssLink), { timeout: settings.responseTimeout })
  .then((response) => {
    try {
      const parsedObj = parseRss(response.data);
      return parsedObj;
    } catch {
      throw new Error('notRss');
    }
  });

const addItemToFeed = (state, feedId, {
  title, description, link, pubDate,
}) => {
  const dateAdded = pubDate || Date.now();
  state.posts.push({
    feedId, title, description, link, dateAdded,
  });
};

const updateFeed = (state, feedId) => {
  const feed = state.feeds.find(({ id }) => (feedId === id));
  const { link } = feed;
  loadRss(link).then((parsedRss) => {
    const {
      title, description, items,
    } = parsedRss;
    feed.link = link;
    feed.title = title;
    feed.description = description;
    const oldItems = state.posts.filter(({ feedId: currentFeedId }) => (feedId === currentFeedId));
    const feedHasItem = (item) => (
      oldItems.findIndex(({ link: currentLink }) => (currentLink === item.link)) !== -1
    );
    const newItems = items.filter((item) => !(feedHasItem(item)));
    newItems.forEach((item) => addItemToFeed(state, feedId, item));
  }).catch((e) => {
    console.log(`ERROR while updating feed ${link}:`, e);
  }).then(() => setTimeout(() => updateFeed(state, feedId), settings.refreshTimeout));
};

const generateSubmitHandler = (state) => (event) => {
  event.preventDefault();
  const formValue = state.form.value;
  const url = new URL(formValue);
  const rssLink = url.href;
  // eslint-disable-next-line no-param-reassign
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
      // eslint-disable-next-line no-param-reassign
      state.form.value = '';
      // eslint-disable-next-line no-param-reassign
      state.form.error = '';
      // eslint-disable-next-line no-param-reassign
      state.form.processState = 'filling';
      // eslint-disable-next-line no-param-reassign
      state.form.valid = true;
      setTimeout(() => updateFeed(state, id), settings.refreshTimeout);
    })
    .catch((error) => {
      // eslint-disable-next-line no-param-reassign
      state.form.processState = 'filling';
      const errorType = getErrorType(error);
      // eslint-disable-next-line no-param-reassign
      state.form.error = errorType;
      if (errorType === 'unknownError') {
        console.log('Unexpected error occured:');
        console.log(error);
      }
    });
};

const generateValidationSchema = (state) => {
  const isUnique = (str) => {
    const url = new URL(str);
    const rssLink = url.href;
    const { feeds } = state;
    return (feeds.findIndex(({ link }) => (link === rssLink)) === -1);
  };
  const schema = yup.object().shape({
    url: yup.string().required().url().test('alreadyAdded', 'alreadyAdded', isUnique),
  });
  return schema;
};

const generateInputHandler = (state) => {
  const validationSchema = generateValidationSchema(state);
  const isValid = (string) => {
    try {
      validationSchema.validateSync({ url: string });
      return true;
    } catch {
      return false;
    }
  };
  return (event) => {
    event.preventDefault();
    const { value } = event.target;
    // eslint-disable-next-line no-param-reassign
    state.form.value = value;
    // eslint-disable-next-line no-param-reassign
    state.form.valid = isValid(value) || (value === '');
  };
};

export default () => {
  const state = {
    feeds: [],
    posts: [],
    form: {
      processState: 'filling',
      value: '',
      error: '',
      valid: true,
    },
  };
  const elements = {};
  elements.form = document.querySelector('form.rss-form');
  elements.feedsColElement = document.querySelector('div.rss-feeds');
  elements.itemsColElement = document.querySelector('div.rss-items');
  elements.formFeedbackElement = document.querySelector('div.feedback');
  i18next.init({
    lng: 'en',
    debug: true,
    resources: texts,
  }).then(() => {
    initWatchers(state, elements);
    elements.form.addEventListener('submit', generateSubmitHandler(state));
    const inputField = elements.form.querySelector('input[name="url"]');
    inputField.addEventListener('input', generateInputHandler(state));
  });
};
