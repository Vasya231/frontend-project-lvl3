import { uniqueId } from 'lodash';

class State {
  feeds = [];

  items = [];

  form = {
    state: 'invalid',
    value: '',
  };

  addFeed = (title, description) => {
    const id = uniqueId();
    this.feeds.push({ id, title, description });
    return id;
  };

  addItem = (title, description, link, pubdate) => {
    const id = uniqueId();
    this.items.push({
      id, title, description, link, pubdate,
    });
    return id;
  };

  getFeeds = () => this.feeds;

  getItems = () => this.items;
}

export default State;
