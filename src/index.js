// import _ from 'lodash';
import axios from 'axios';
import './scss/app.scss';
import parse from './utils';
import render from './view';
import State from './State';

const testRss = () => {
  const state = new State();
  axios.get('https://ru.hexlet.io/lessons.rss').then((response) => {
    console.log(response);
    const parsedObj = parse(response);
    state.addFeed(parsedObj.rssFeedTitle, parsedObj.rssFeedDesc);
    parsedObj.itemList.forEach(({
      title, description, link,
    }) => state.addItem(title, description, link,));
    console.log(JSON.stringify(state, null, 2));
    render(state);
  });
};

testRss();
