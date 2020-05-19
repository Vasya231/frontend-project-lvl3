import init from './view';
import State from './State';
import { generateInputHandler, generateSubmitHandler, restartTimer } from './controller';

export default () => {
  const state = new State();
  const form = document.querySelector('form.rss-form');
  const inputField = form.querySelector('input[name="url"]');
  init(state, generateSubmitHandler(state), generateInputHandler(state), form, inputField);
  restartTimer(state);
};
