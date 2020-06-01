import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import { uniqueId, differenceWith } from 'lodash';
import texts from './locales';
import initWatchers from './view';
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
  // eslint-disable-next-line no-param-reassign
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
      // eslint-disable-next-line no-param-reassign
      state.addingFeedProcess.processState = 'stopped';
      // eslint-disable-next-line no-param-reassign
      state.form.value = '';
      // eslint-disable-next-line no-param-reassign
      state.form.fillingProcess.valueValidationState = 'empty';
      setTimeout(() => updateFeed(state, id), settings.refreshTimeout);
    })
    .catch((error) => {
      // eslint-disable-next-line no-param-reassign
      state.addingFeedProcess.processState = 'stoppedWithError';
      const { message } = error;
      // eslint-disable-next-line no-param-reassign
      state.addingFeedProcess.error = message;
    });
};

const isValidUrl = (feeds, string) => {
  const isUnique = (str) => {
    const url = new URL(str);
    const rssLink = url.href;
    return (feeds.findIndex(({ link }) => (link === rssLink)) === -1);
  };
  const validationSchema = yup.object().shape({
    url: yup.string().required().url().test('alreadyAdded', 'alreadyAdded', isUnique),
  });
  try {
    validationSchema.validateSync({ url: string });
    return true;
  } catch {
    return false;
  }
};

const generateInputHandler = (state) => (event) => {
  event.preventDefault();
  const { value } = event.target;
  const { feeds } = state;
  // eslint-disable-next-line no-param-reassign
  state.form.value = value;
  if (value === '') {
    // eslint-disable-next-line no-param-reassign
    state.form.fillingProcess.valueValidationState = 'empty';
  } else if (isValidUrl(feeds, value)) {
    // eslint-disable-next-line no-param-reassign
    state.form.fillingProcess.valueValidationState = 'valid';
  } else {
    // eslint-disable-next-line no-param-reassign
    state.form.fillingProcess.valueValidationState = 'invalid';
    // eslint-disable-next-line no-param-reassign
    state.form.fillingProcess.error = 'doesnt matter';
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
    elements.form.addEventListener('submit', generateSubmitHandler(state));
    const inputField = elements.form.querySelector('input[name="url"]');
    inputField.addEventListener('input', generateInputHandler(state));
  });
};
