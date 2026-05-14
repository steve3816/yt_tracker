const config = require('./config');
const { fetchLatestItems } = require('./services/youtubeRss');
const { filterAndSummarize } = require('./services/summarizer');
const { sendSummary } = require('./services/lineNotifier');

async function main() {
  const items = await fetchLatestItems(config.youtubeRssUrl); // 從 YouTube RSS 取得最新影片列表
  if (!items.length) {
    console.log('未取得任何 RSS 項目。');
    return;
  }

  console.log(`取得 ${items.length} 支最新影片，分析中...`);
  const { videos, rawItems } = await filterAndSummarize(items); // 給 AI 分析並產生摘要
  await sendSummary(videos, rawItems); // 發送摘要到 LINE
}

main().catch((error) => {
  console.error('執行失敗：', error.message);
  process.exit(1);
});
