import { uniqueId } from 'lodash';

class State {
  feeds = [];

  posts = [];

  form = {
    processState: 'filling',
    value: '',
    error: '',
    valid: true,
  };

  addFeed = (link, title, description, items = []) => {
    const id = uniqueId();
    const newFeed = {
      id, link, title, description, items: [],
    };
    this.getFeeds().push(newFeed);
    this.addItemsToFeed(id, items);
    return id;
  };

  addItemToFeed = (feedId, title, description, link, pubDate) => {
    const id = uniqueId();
    const dateAdded = pubDate || Date.now();
    this.posts.push({
      id, feedId, title, description, link, dateAdded,
    });
    return id;
  };

  addItemsToFeed = (feedId, items) => {
    const ids = [];
    items.forEach(({
      title, description, link, pubDate,
    }) => {
      const id = this.addItemToFeed(feedId, title, description, link, pubDate);
      ids.push(id);
    });
    return ids;
  };

  updateFeed = (feedId, link, title, description, items) => {
    const feed = this.getFeed(feedId);
    feed.link = link;
    feed.title = title;
    feed.description = description;
    const newItems = items.filter((item) => !(this.feedHasItem(feedId, item)));
    this.addItemsToFeed(feedId, newItems);
  };

  getFeed = (id) => this.getFeeds().find(({ id: currentId }) => (currentId === id));

  getFeeds = () => this.feeds;

  getItems = () => this.posts.slice()
    .sort(({ dateAdded: date1 }, { dateAdded: date2 }) => (date2 - date1));

  getFormValue = () => this.form.value;

  setFormValue = (value) => {
    this.form.value = value;
  };

  getFormError = () => this.form.error;

  setFormError = (error) => {
    this.form.error = error;
  };

  setFormState = (processState) => {
    this.form.processState = processState;
  };

  getFormState = () => this.form.processState;

  setFormValidity = (isValid) => {
    this.form.valid = isValid;
  }

  isFormValid = () => this.form.valid;

  feedHasItem = (id, item) => {
    const items = this.posts.filter(({ feedId }) => (feedId === id));
    return (items.findIndex(({ link }) => (link === item.link)) !== -1);
  }
}

export default State;
