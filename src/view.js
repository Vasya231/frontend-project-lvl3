import { watch } from 'melanke-watchjs';
import i18 from 'i18next';

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

const renderFeeds = ({ feeds, posts }, feedsColElement, itemsColElement) => {
  feedsColElement.innerHTML = '';
  itemsColElement.innerHTML = '';
  const sortedPosts = [...posts].sort(
    ({ dateAdded: date1 }, { dateAdded: date2 }) => (date2 - date1),
  );
  feeds.forEach((feed) => feedsColElement.append(generateFeedElement(feed)));
  sortedPosts.forEach((item) => itemsColElement.append(generateItemElement(item)));
};

const renderForm = (state, form, feedbackElement) => {
  const submitButton = form.querySelector('button[type="submit"]');
  const inputField = form.querySelector('input[name="url"]');
  const {
    processState, error, value, valid,
  } = state.form;
  inputField.value = value;
  switch (processState) {
    case 'filling':
      submitButton.removeAttribute('disabled');
      feedbackElement.textContent = error ? getErrorMessage(error) : '';
      if (valid) {
        inputField.classList.remove('is-invalid');
      } else {
        inputField.classList.add('is-invalid');
        submitButton.setAttribute('disabled', '');
      }
      break;
    case 'sending':
      submitButton.setAttribute('disabled', '');
      feedbackElement.textContent = error ? getErrorMessage(error) : '';
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
) => {
  watch(state, 'posts', () => {
    renderFeeds(state, feedsColElement, itemsColElement);
  });
  watch(state, 'form', () => {
    renderForm(state, form, formFeedbackElement);
  });
};


export default init;
