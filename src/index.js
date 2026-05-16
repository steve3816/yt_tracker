const config = require('./config');
const { fetchLatestItems } = require('./services/youtubeRss');
const { filterAndSummarize } = require('./services/summarizer');
const { sendSummary } = require('./services/lineNotifier');

async function runTask(task) {
  console.log(`\n=== 執行任務：${task.description} ===`);
  const items = await fetchLatestItems(task.youtubeRssUrl);
  if (!items.length) {
    console.log('未取得任何 RSS 項目。');
    return;
  }

  console.log(`取得 ${items.length} 支最新影片：`);
  items.forEach((item, index) => console.log(`  ${index + 1}. ${item.title}`));
  console.log('分析中...');
  const { videos, rawItems } = await filterAndSummarize(items, task);
  await sendSummary(videos, rawItems, task);
}

async function main() {
  for (const task of config.tasks) {
    await runTask(task);
  }
}

main().catch((error) => {
  console.error('執行失敗：', error.message);
  process.exit(1);
});
