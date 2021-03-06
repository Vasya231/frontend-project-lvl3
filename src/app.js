/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import { uniqueId, differenceBy } from 'lodash';
import texts from './locales';
import { initWatchers, syncForm } from './view';
import { parseRss, proxifyUrl } from './utils';
import settings from './settings';

const loadRss = (rssLink) => axios
  .get(proxifyUrl(rssLink), { timeout: settings.responseTimeout })
  .then((response) => {
    const parsedObj = parseRss(response.data);
    return parsedObj;
  });

const generatePost = (feedId, {
  title, description, link, pubDate,
}) => ({
  feedId,
  title,
  description,
  link,
  dateAdded: (pubDate || Date.now()),
});

const getRssLoadingErrorCode = (error) => {
  if (error.isParserError) {
    return 'notRss';
  }
  const { message, response } = error;
  if (response) {
    return (response.status);
  }
  if (message === `timeout of ${settings.responseTimeout}ms exceeded`) {
    return 'timeoutError';
  }
  return 'unknownError';
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
    const newPosts = items.map(generatePost.bind(null, feedId));
    const oldPosts = state.posts.filter(({ feedId: currentFeedId }) => (currentFeedId === feedId));
    const addedPosts = differenceBy(newPosts, oldPosts, ({ link: currentLink }) => (currentLink));
    state.posts.push(...addedPosts);
  }).catch((e) => {
    console.log(`ERROR while updating feed ${link}:`, e);
  }).then(() => setTimeout(() => updateFeed(state, feedId), settings.refreshTimeout));
};

const generateSubmitHandler = (state) => (event) => {
  event.preventDefault();
  const formValue = state.form.value;
  const url = new URL(formValue);
  const rssLink = url.href;
  state.addingFeedProcess.processState = 'working';
  loadRss(rssLink)
    .then((parsedRss) => {
      const {
        title, description, items,
      } = parsedRss;
      const id = uniqueId();
      const newFeed = {
        id, link: rssLink, title, description,
      };
      state.feeds.push(newFeed);
      const posts = items.map(generatePost.bind(null, id));
      state.posts.push(...posts);
      state.addingFeedProcess.processState = 'stopped';
      state.form.value = '';
      state.form.fillingProcess.status = 'empty';
      setTimeout(() => updateFeed(state, id), settings.refreshTimeout);
    })
    .catch((error) => {
      state.addingFeedProcess.processState = 'stoppedWithError';
      console.log(error.message);
      const errorCode = getRssLoadingErrorCode(error);
      state.addingFeedProcess.error = errorCode;
    });
};

const validateUrl = (feeds, inputValue) => {
  const stringValidationSchema = yup.string().required().url('notUrl');
  stringValidationSchema.validateSync(inputValue);
  const url = new URL(inputValue);
  const rssLink = url.href;
  const oldLinks = feeds.map(({ link }) => link);
  const rssLinkValidationSchema = yup.mixed().notOneOf(oldLinks, 'alreadyAdded');
  rssLinkValidationSchema.validateSync(rssLink);
};

const generateInputHandler = (state) => (event) => {
  event.preventDefault();
  const { value } = event.target;
  const { feeds } = state;
  state.form.value = value;
  if (value === '') {
    state.form.fillingProcess.status = 'empty';
  } else {
    try {
      validateUrl(feeds, value);
      state.form.fillingProcess.status = 'valid';
    } catch ({ message }) {
      state.form.fillingProcess.status = 'invalid';
      state.form.fillingProcess.error = message;
    }
  }
};

export default () => {
  const state = {
    feeds: [],
    posts: [],
    form: {
      fillingProcess: {
        status: 'empty',
        error: '',
      },
      value: '',
    },
    addingFeedProcess: {
      processState: 'stopped',
      error: '',
    },
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    feedsColElement: document.querySelector('.rss-feeds'),
    itemsColElement: document.querySelector('.rss-items'),
    formFeedbackElement: document.querySelector('.feedback'),
  };
  i18next.init({
    lng: 'en',
    debug: true,
    resources: texts,
  }).then(() => {
    initWatchers(state, elements);
    syncForm(state, elements);
    elements.form.addEventListener('submit', generateSubmitHandler(state));
    const inputField = elements.form.querySelector('input[name="url"]');
    inputField.addEventListener('input', generateInputHandler(state));
  });
};
