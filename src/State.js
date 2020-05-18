import { uniqueId } from 'lodash';

class State {
  feeds = [];

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

  addItemToFeed = (feedId, title, description, link) => {
    const id = uniqueId();
    const feed = this.getFeed(feedId);
    const dateAdded = Date.now();
    feed.items.push({
      id, feedId, title, description, link, dateAdded,
    });
    return id;
  };

  addItemsToFeed = (feedId, items) => {
    const ids = [];
    items.forEach(({ title, description, link }) => {
      const id = this.addItemToFeed(feedId, title, description, link);
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

  getItems = () => this.getFeeds()
    .reduce(
      (acc, { items }) => [...acc, ...items],
      [],
    )
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
    const { items } = this.getFeed(id);
    return (items.findIndex(({ link }) => (link === item.link)) !== -1);
  }
}

export default State;
