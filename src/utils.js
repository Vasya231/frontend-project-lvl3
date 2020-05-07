import * as yup from 'yup';

const generateListItem = (item) => {
  // console.log(item);
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;
  return {
    title, link, description,
  };
};

const parseRss = (data) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'text/xml');
  const title = xml.querySelector('channel > title').textContent;
  const description = xml.querySelector('channel > description').textContent;
  const items = xml.querySelectorAll('channel > item');
  const itemList = [...items].map(generateListItem);
  return { title, description, itemList };
};

const schema = yup.object().shape({
  url: yup.string().required().url(),
});

const isValidUrl = (string) => {
  try {
    schema.validateSync({ url: string });
    return true;
  } catch {
    return false;
  }
};

export { parseRss, isValidUrl };
