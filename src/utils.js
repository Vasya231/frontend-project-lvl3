const generateListItem = (item) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;
  const pubDateEl = item.querySelector('pubDate');
  const pubDate = pubDateEl ? Date.parse(pubDateEl.textContent) : null;
  return {
    title, link, description, pubDate,
  };
};

const parseRss = (data) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'text/xml');
  const title = xml.querySelector('channel > title').textContent;
  const description = xml.querySelector('channel > description').textContent;
  const itemsXml = xml.querySelectorAll('channel > item');
  const items = [...itemsXml].map(generateListItem);
  return { title, description, items };
};

const proxifyUrl = (url) => `https://cors-anywhere.herokuapp.com/${url}`;

export { parseRss, proxifyUrl };
