import { watch } from 'melanke-watchjs';
import i18next from 'i18next';

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

const getErrorMessage = (error) => i18next.t(`errors.${error}`, 'errors.unknownError');

const renderFeeds = ({ feeds, posts }, feedsColElement, itemsColElement) => {
  // eslint-disable-next-line no-param-reassign
  feedsColElement.innerHTML = '';
  // eslint-disable-next-line no-param-reassign
  itemsColElement.innerHTML = '';
  const sortedPosts = [...posts].sort(
    ({ dateAdded: date1 }, { dateAdded: date2 }) => (date2 - date1),
  );
  feeds.forEach((feed) => feedsColElement.append(generateFeedElement(feed)));
  sortedPosts.forEach((item) => itemsColElement.append(generateItemElement(item)));
};

const renderForm = (state, formEl, feedbackElement) => {
  const submitButton = formEl.querySelector('button[type="submit"]');
  const inputField = formEl.querySelector('input[name="url"]');
  const { form, addingFeedProcess } = state;
  const { fillingProcess, value } = form;
  inputField.value = value;
  let submitButtonEnabled;
  switch (fillingProcess.valueValidationState) {
    case 'empty':
      submitButtonEnabled = false;
      inputField.classList.remove('is-invalid');
      submitButton.setAttribute('title', '');
      break;
    case 'valid':
      submitButtonEnabled = true;
      inputField.classList.remove('is-invalid');
      submitButton.setAttribute('title', '');
      break;
    case 'invalid':
      submitButtonEnabled = false;
      inputField.classList.add('is-invalid');
      submitButton.setAttribute('title', getErrorMessage(fillingProcess.error));
      // Вывести fillingProcess.error, если есть куда.
      break;
    default: throw new Error(`Wrong value validation state: ${fillingProcess.valueValidationState}`);
  }
  switch (addingFeedProcess.processState) {
    case 'stopped':
      // eslint-disable-next-line no-param-reassign
      feedbackElement.textContent = '';
      break;
    case 'stoppedWithError':
      // eslint-disable-next-line no-param-reassign
      feedbackElement.textContent = getErrorMessage(addingFeedProcess.error);
      break;
    case 'working':
      // eslint-disable-next-line no-param-reassign
      feedbackElement.textContent = '';
      submitButtonEnabled = false;
      break;
    default: throw new Error(`Wrong adding feed state: ${addingFeedProcess.processState}`);
  }
  if (submitButtonEnabled) {
    submitButton.removeAttribute('disabled');
  } else {
    submitButton.setAttribute('disabled', '');
  }
};

const initWatchers = (
  state,
  {
    form,
    formFeedbackElement,
    feedsColElement,
    itemsColElement,
  },
) => {
  watch(state, 'posts', () => {
    renderFeeds(state, feedsColElement, itemsColElement);
  });
  watch(state, ['form', 'addingFeedProcess'], () => {
    renderForm(state, form, formFeedbackElement);
  });
  renderForm(state, form, formFeedbackElement);
};


export default initWatchers;
