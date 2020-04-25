// import _ from 'lodash';
import axios from 'axios';
import './scss/app.scss';

const testRss = () => {
  const element = document.createElement('div');
  console.log('111');
  axios.get('https://ru.hexlet.io/lessons.rss').then((response) => {
    const text = JSON.stringify(response, null, 2);
    element.textContent = text;
    console.log(text);
    document.body.append(element);
  });
};

testRss();
