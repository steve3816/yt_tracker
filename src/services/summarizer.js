const config = require('../config');
const { callAIProviders } = require('./aiClient');

function parseModelResponse(content) {
  if (content.includes('沒有找到科技相關的影片')) {
    return [];
  }

  const videos = [];
  const sections = content.split('---').filter((s) => s.trim());

  sections.forEach((section) => {
    const lines = section.trim().split('\n');
    let title = '';
    let link = '';
    let summary = '';

    lines.forEach((line) => {
      if (line.includes('影片名稱：')) {
        title = line.replace('影片名稱：', '').trim();
      } else if (line.includes('影片連結：')) {
        link = line.replace('影片連結：', '').trim();
      } else if (line.includes('大綱：')) {
        summary = line.replace('大綱：', '').trim();
      }
    });

    if (title && link) {
      videos.push({ title, link, summary });
    }
  });

  return videos;
}

async function filterAndSummarize(items) {
  if (!config.aiProviderOrder.length) {
    throw new Error('AI_PROVIDER_ORDER 未設定');
  }

  const videosText = items
    .map(
      (item, index) =>
        `${index + 1}. 標題：${item.title}\n連結：${item.link}\n描述：${item.description}`
    )
    .join('\n\n');

  const prompt = `以下是最新的 ${items.length} 支影片列表：

${videosText}

${config.task.prompt}`;

  const content = await callAIProviders(prompt);
  const videos = parseModelResponse(content.trim());
  return {
    videos,
    rawItems: items,
  };
}

module.exports = {
  filterAndSummarize,
};
