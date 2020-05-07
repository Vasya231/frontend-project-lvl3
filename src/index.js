// import _ from 'lodash';
import axios from 'axios';
import './scss/app.scss';
import init from './view';
import State from './State';
import { parseRss, isValid } from './utils';

const loadRss = (rssLink) => axios.get(rssLink).then((response) => {
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
    return promise;
  });
  Promise.all(updatePromises);
};

const generateSubmitHandler = (state) => (event) => {
  event.preventDefault();
  const rssLink = state.getFormValue();
  const feeds = state.getFeeds();
  if (!isValid(rssLink)) {
    state.setFormError('notUrl');
    return;
  }
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
      state.setFormValidity(false);
    })
    .catch((error) => {
      state.setFormState('filling');
      state.setFormError(error.message);
    });
};

const generateInputHandler = (state) => (event) => {
  event.preventDefault();
  const { value } = event.target;
  state.setFormValue(value);
  state.setFormValidity((value !== ''));
};

const app = () => {
  const state = new State();
  init(state, generateSubmitHandler(state), generateInputHandler(state));
  setInterval(() => updateFeeds(state), 10000);
};

app();
