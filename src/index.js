import _ from 'lodash';
import 'bootstrap/dist/css/bootstrap.min.css';

const component = () => {
  const element = document.createElement('div');
  console.log('111');
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  return element;
};

document.body.append(component());
