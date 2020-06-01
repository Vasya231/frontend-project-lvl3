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

const getErrorMessage = (error) => i18next.t(`errors.${error}`);

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
  switch (fillingProcess.processState) {
    case 'empty':
      submitButton.setAttribute('disabled', '');
      inputField.classList.remove('is-invalid');
      break;
    case 'valid':
      submitButton.removeAttribute('disabled');
      inputField.classList.remove('is-invalid');
      break;
    case 'invalid':
      submitButton.setAttribute('disabled', '');
      inputField.classList.add('is-invalid');
      // Вывести fillingProcess.error, если есть куда.
      break;
    default: throw new Error(`Wrong filling state: ${fillingProcess.processState}`);
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
      submitButton.setAttribute('disabled', '');
      break;
    default: throw new Error(`Wrong filling state: ${addingFeedProcess.processState}`);
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
