import { uniqueId } from 'lodash';

class State {
  feeds = [];

  showedItems = [];

  form = {
    state: 'invalid',
    value: '',
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
      id, title, description, link,
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

  updateShowedItems = () => {
    this.showedItems = this.getFeeds().reduce(
      (acc, { itemList }) => [...acc, ...itemList],
      [],
    );
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

  getItems = () => this.showedItems;
}

export default State;
