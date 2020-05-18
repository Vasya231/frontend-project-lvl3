import init from './view';
import State from './State';
import { generateInputHandler, generateSubmitHandler, restartTimer } from './controller';

export default () => {
  const state = new State();
  init(state, generateSubmitHandler(state), generateInputHandler(state));
  restartTimer(state);
};
