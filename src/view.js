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

const render = (state) => {
  const feedsColElement = document.querySelector('div.rss-feeds');
  const itemsColElement = document.querySelector('div.rss-items');
  feedsColElement.innerHTML = '';
  itemsColElement.innerHTML = '';
  state.getFeeds().forEach((feed) => feedsColElement.append(generateFeedElement(feed)));
  state.getItems().forEach((item) => itemsColElement.append(generateItemElement(item)));
};

export default render;
