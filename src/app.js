/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import { uniqueId, differenceWith } from 'lodash';
import texts from './locales';
import { initWatchers, syncForm } from './view';
import { parseRss, proxifyUrl } from './utils';
import settings from './settings';

const loadRss = (rssLink) => axios
  .get(proxifyUrl(rssLink), { timeout: settings.responseTimeout })
  .catch((error) => {
    const { response } = error;
    if (response) {
      throw new Error(response.status);
    } else {
      throw new Error('axiosDefault');
    }
  })
  .then((response) => {
    try {
      const parsedObj = parseRss(response.data);
      return parsedObj;
    } catch {
      throw new Error('parserError');
    }
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
    const posts = items.map(generatePost.bind(null, feedId));
    const newPosts = differenceWith(posts, state.posts,
      ({ feedId: id1, link: link1 }, { feedId: id2, link: link2 }) => (
        (id1 === id2) && (link1 === link2)
      ));
    state.posts.push(...newPosts);
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
        id, link: rssLink, title, description, items: [],
      };
      state.feeds.push(newFeed);
      const posts = items.map(generatePost.bind(null, id));
      state.posts.push(...posts);
      state.addingFeedProcess.processState = 'stopped';
      state.form.value = '';
      state.form.fillingProcess.valueValidationState = 'empty';
      setTimeout(() => updateFeed(state, id), settings.refreshTimeout);
    })
    .catch((error) => {
      state.addingFeedProcess.processState = 'stoppedWithError';
      const { message } = error;

      state.addingFeedProcess.error = message;
    });
};

const validateUrl = (feeds, string) => {
  const stringValidationSchema = yup.string().required().url('notUrl');
  stringValidationSchema.validateSync(string);
  const url = new URL(string);
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
    state.form.fillingProcess.valueValidationState = 'empty';
  } else {
    try {
      validateUrl(feeds, value);
      state.form.fillingProcess.valueValidationState = 'valid';
    } catch ({ message }) {
      state.form.fillingProcess.valueValidationState = 'invalid';
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
        valueValidationState: 'empty',
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
    form: document.querySelector('form.rss-form'),
    feedsColElement: document.querySelector('div.rss-feeds'),
    itemsColElement: document.querySelector('div.rss-items'),
    formFeedbackElement: document.querySelector('div.feedback'),
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
