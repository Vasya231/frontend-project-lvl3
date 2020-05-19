import i18 from 'i18next';
import texts from './locales';
import init from './view';
import State from './State';
import { generateInputHandler, generateSubmitHandler, restartTimer } from './controller';

export default () => {
  const state = new State();
  const elements = {};
  elements.form = document.querySelector('form.rss-form');
  elements.feedsColElement = document.querySelector('div.rss-feeds');
  elements.itemsColElement = document.querySelector('div.rss-items');
  elements.formFeedbackElement = document.querySelector('div.feedback');
  i18.init({
    lng: 'en',
    debug: true,
    resources: texts,
  }).then(() => {
    init(state, elements);
    elements.form.addEventListener('submit', generateSubmitHandler(state));
    const inputField = elements.form.querySelector('input[name="url"]');
    inputField.addEventListener('input', generateInputHandler(state));
    restartTimer(state);
  });
};
