import './scss/app.scss';
import initApp from './view';
import State from './State';
import { generateInputHandler, generateSubmitHandler, restartTimer } from './controller';

const state = new State();
initApp(state, generateSubmitHandler(state), generateInputHandler(state));
restartTimer(state);
