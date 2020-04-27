// import _ from 'lodash';
import axios from 'axios';
import './scss/app.scss';
import parse from './utils';
import watch from './view';
import State from './State';

const testRss = (rssLink, state) => {
  axios.get(rssLink).then((response) => {
    console.log(response);
    const parsedObj = parse(response);
    state.addFeed(rssLink, parsedObj.rssFeedTitle, parsedObj.rssFeedDesc);
    parsedObj.itemList.forEach(({
      title, description, link,
    }) => state.addItem(title, description, link));
    console.log(JSON.stringify(state, null, 2));
  });
};

const app = () => {
  const state = new State();
  watch(state);
  testRss('https://codepen.io/picks/feed/', state);
  setTimeout(() => testRss('https://ru.hexlet.io/lessons.rss', state), 10000);
};

app();
