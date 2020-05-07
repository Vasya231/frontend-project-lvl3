import { watch } from 'melanke-watchjs';
import i18 from 'i18next';
import texts from './locales';

const generateFeedElement = ({ title, description }) => {
  const el = document.createElement('div');
  const titleEl = document.createElement('div');
  const descriptionEl = document.createElement('div');
  titleEl.textContent = title;
  descriptionEl.textContent = description;
  el.append(titleEl, descriptionEl);
  return el;
};

const generateItemElement = ({ title, link }) => {
  const el = document.createElement('div');
  const innerLink = document.createElement('a');
  innerLink.setAttribute('href', link);
  innerLink.textContent = title;
  el.append(innerLink);
  return el;
};

const getErrorMessage = (error) => i18.t(`errors.${error}`);

const renderFeeds = (state) => {
  console.log(JSON.stringify(state, null, 2));
  const feedsColElement = document.querySelector('div.rss-feeds');
  const itemsColElement = document.querySelector('div.rss-items');
  feedsColElement.innerHTML = '';
  itemsColElement.innerHTML = '';
  state.getFeeds().forEach((feed) => feedsColElement.append(generateFeedElement(feed)));
  state.getItems().forEach((item) => itemsColElement.append(generateItemElement(item)));
};

const renderForm = (state) => {
  const feedbackDiv = document.querySelector('div.feedback');
  const submitButton = document.querySelector('button[type="submit"]');
  const inputField = document.querySelector('input[name="url"]');
  const processState = state.getFormState();
  switch (processState) {
    case 'filling': {
      submitButton.removeAttribute('disabled');
      const error = state.getFormError();
      feedbackDiv.textContent = error ? getErrorMessage(error) : '';
      inputField.value = state.getFormValue();
      break;
    }
    case 'sending':
      submitButton.setAttribute('disabled', '');
      feedbackDiv.textContent = state.getFormError();
      inputField.value = state.getFormValue();
      break;
    default: throw new Error(`Wrong state: ${processState}`);
  }
};

const init = (state, submitHandler, inputHandler) => {
  i18.init({
    lng: 'en',
    debug: true,
    resources: texts,
  }).then(() => {
    const inputField = document.querySelector('input[name="url"]');
    const form = document.querySelector('form');
    form.addEventListener('submit', submitHandler);
    inputField.addEventListener('input', inputHandler);
    renderForm(state);
    watch(state, 'feeds', () => {
      renderFeeds(state);
    });
    watch(state, 'form', () => {
      renderForm(state);
    });
  });
};

export default init;
