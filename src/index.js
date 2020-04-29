// import _ from 'lodash';
import axios from 'axios';
import './scss/app.scss';
import watch from './view';
import State from './State';
import parseRss from './utils';

const loadRss = (rssLink) => axios.get(rssLink).then((response) => {
  const isRss = response.headers['content-type'].includes('application/rss+xml');
  if (!isRss) {
    throw new Error('Not an RSS feed!');
  }
  const parsedObj = parseRss(response);
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
  Promise.all(updatePromises).then(state.updateShowedItems).catch(state.updateShowedItems);
};

const app = () => {
  const state = new State();
  watch(state);
  // testRss('https://codepen.io/picks/feed/', state);
  // setTimeout(() => testRss('https://ru.hexlet.io/', state), 10000);
  loadRss('https://codepen.io/picks/feed/').then((parsedRss) => {
    const {
      title, description, itemList,
    } = parsedRss;
    state.addFeed('https://codepen.io/picks/feed/', title, description, itemList);
    state.updateShowedItems();
  });
  setInterval(() => updateFeeds(state), 10000);
};

app();
