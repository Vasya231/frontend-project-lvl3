import './scss/app.scss';
import initView from './view';
import State from './State';
import { generateInputHandler, generateSubmitHandler, restartTimer } from './controller';

const state = new State();
initView(state, generateSubmitHandler(state), generateInputHandler(state));
restartTimer(state);
