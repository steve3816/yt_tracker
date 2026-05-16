const config = require('../config');
const { callAIProviders } = require('./aiClient');

function parseModelResponse(content) {
  const match = content.match(/\[[\s\S]*\]/);
  if (!match) return [];

  const parsed = JSON.parse(match[0]);
  return parsed.filter((v) => v.title && v.link);
}

async function filterAndSummarize(items, task) {
  task = task || config.tasks[0];
  if (!config.aiProviderOrder.length) {
    throw new Error('AI_PROVIDER_ORDER 未設定');
  }

  const videosText = items
    .map(
      (item, index) =>
        `${index + 1}. 標題：${item.title}\n連結：${item.link}\n描述：${item.description}`
    )
    .join('\n\n');

  const FORMAT_INSTRUCTION = `請依據上述篩選條件分析影片，並以 JSON array 格式回傳符合條件的影片，不符合條件的影片不要包含。
每個元素格式為：{"title": "影片名稱", "link": "影片連結", "summary": "50字以內的大綱"}
若無符合條件的影片，回傳空 array：[]
只回傳 JSON，不要有其他文字。`;

  const prompt = `以下是最新的 ${items.length} 支影片列表：

${videosText}

篩選條件：${task.criteria}

${FORMAT_INSTRUCTION}`;

  const content = await callAIProviders(prompt);
  const pubDateMap = new Map(items.map((item) => [item.link, item.pubDate]));
  const videos = parseModelResponse(content.trim()).map((v) => ({
    ...v,
    pubDate: pubDateMap.get(v.link) || '',
  }));
  return {
    videos,
    rawItems: items,
  };
}

module.exports = {
  filterAndSummarize,
};
