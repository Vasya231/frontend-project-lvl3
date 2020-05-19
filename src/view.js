import { watch } from 'melanke-watchjs';
import i18 from 'i18next';
import texts from './locales';

const generateFeedElement = ({ title, description }) => {
  const el = document.createElement('div');
  el.classList.add('list-group-item');
  const titleEl = document.createElement('h3');
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

const renderFeeds = (state, feedsColElement, itemsColElement) => {
  feedsColElement.innerHTML = '';
  itemsColElement.innerHTML = '';
  state.getFeeds().forEach((feed) => feedsColElement.append(generateFeedElement(feed)));
  state.getItems().forEach((item) => itemsColElement.append(generateItemElement(item)));
};

const renderForm = (state, form, feedbackElement) => {
  const submitButton = form.querySelector('button[type="submit"]');
  const inputField = form.querySelector('input[name="url"]');
  const processState = state.getFormState();
  const error = state.getFormError();
  switch (processState) {
    case 'filling':
      submitButton.removeAttribute('disabled');
      feedbackElement.textContent = error ? getErrorMessage(error) : '';
      inputField.value = state.getFormValue();
      if (state.isFormValid()) {
        inputField.classList.remove('is-invalid');
      } else {
        inputField.classList.add('is-invalid');
      }
      break;
    case 'sending':
      submitButton.setAttribute('disabled', '');
      feedbackElement.textContent = error ? getErrorMessage(error) : '';
      inputField.value = state.getFormValue();
      break;
    default: throw new Error(`Wrong state: ${processState}`);
  }
};

const init = (
  state,
  {
    form,
    formFeedbackElement,
    feedsColElement,
    itemsColElement,
  },
) => i18.init({
  lng: 'en',
  debug: true,
  resources: texts,
}).then(() => {
  form.reset();
  watch(state, 'feeds', () => {
    renderFeeds(state, feedsColElement, itemsColElement);
  });
  watch(state, 'form', () => {
    renderForm(state, form, formFeedbackElement);
  });
  return Promise.resolve();
});


export default init;
