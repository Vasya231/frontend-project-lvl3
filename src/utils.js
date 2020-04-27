const generateListItem = (item) => {
  console.log(item);
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').nextSibling.textContent.trim();
  const date = new Date(item.querySelector('pubdate').textContent);
  return {
    title, link, description, date,
  };
};

const parseRss = (rssResponse) => {
  const parser = new DOMParser();
  const html = parser.parseFromString(rssResponse.data, 'text/html');
  const rssFeedTitle = html.querySelector('channel > title').textContent;
  const rssFeedDesc = html.querySelector('channel > description').textContent;
  const items = html.querySelectorAll('channel > item');
  const itemList = [...items].map(generateListItem);
  return { rssFeedTitle, rssFeedDesc, itemList };
};

export default parseRss;
