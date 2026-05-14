const Parser = require('rss-parser');
const parser = new Parser();

async function fetchLatestItems(rssUrl) {
  try {
    const feed = await parser.parseURL(rssUrl);
    const items = (feed.items || [])
      .map((item) => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
        description: item.contentSnippet || item.description || '',
      }));
    return items;
  } catch (error) {
    console.error(`RSS 解析失敗：${rssUrl}`, error.message);
    throw error;
  }
}

module.exports = {
  fetchLatestItems,
};
