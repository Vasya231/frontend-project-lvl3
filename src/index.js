import _ from 'lodash';
import './scss/app.scss';

const component = () => {
  const element = document.createElement('div');
  console.log('111');
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  return element;
};

document.body.append(component());
