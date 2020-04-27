import { uniqueId } from 'lodash';

class State {
  feeds = [];

  items = [];

  form = {
    state: 'invalid',
    value: '',
  };

  addFeed = (rssLink, title, description) => {
    const id = uniqueId();
    this.feeds.push({
      id, rssLink, title, description,
    });
    return id;
  };

  addItem = (title, description, link) => {
    const id = uniqueId();
    this.items.push({
      id, title, description, link,
    });
    return id;
  };

  getFeeds = () => this.feeds;

  getItems = () => this.items;
}

export default State;
