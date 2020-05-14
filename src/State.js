import { uniqueId } from 'lodash';

class State {
  feeds = [];

  form = {
    processState: 'filling',
    value: '',
    error: '',
    valid: true,
  };

  addFeed = (link, title, description, itemList = []) => {
    const id = uniqueId();
    const newFeed = {
      id, link, title, description, itemList: [],
    };
    this.getFeeds().push(newFeed);
    this.addItemsToFeed(id, itemList);
    return id;
  };

  addItemToFeed = (feedId, title, description, link) => {
    const id = uniqueId();
    const feed = this.getFeed(feedId);
    feed.itemList.push({
      id, feedId, title, description, link,
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

  updateFeed = (feedId, link, title, description, itemList) => {
    const feed = this.getFeed(feedId);
    feed.link = link;
    feed.title = title;
    feed.description = description;
    feed.itemList = [];
    this.addItemsToFeed(feedId, itemList);
  };

  getFeed = (id) => this.getFeeds().find(({ id: currentId }) => (currentId === id));

  getFeeds = () => this.feeds;

  getItems = () => this.getFeeds().reduce(
    (acc, { itemList }) => [...acc, ...itemList],
    [],
  );

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
}

export default State;
