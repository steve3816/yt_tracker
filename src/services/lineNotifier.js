const line = require('@line/bot-sdk');
const config = require('../config');

let client = null;
if (config.lineChannelAccessToken) {
  client = new line.Client({ channelAccessToken: config.lineChannelAccessToken });
}

function formatVideosMessage(videos) {
  if (!videos || videos.length === 0) {
    return '今天沒有找到科技相關的 YouTube 新聞。';
  }

  const message = videos
    .map(
      (video, index) =>
        `【${index + 1}】${video.title}\n\n${video.summary}\n\n${video.link}`
    )
    .join('\n\n───────────\n\n');

  return `TVBS 科技新聞摘要\n(共 ${videos.length} 則)\n\n───────────\n\n${message}`;
}

async function sendSummary(videos) {
  const message = formatVideosMessage(videos);

  if (config.dryRun) {
    console.log('=== DRY RUN 模式 ===');
    console.log(message);
    console.log('=== 結束 ===');
    return;
  }

  if (!client) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN 未設定，無法發送 LINE 訊息。');
  }

  if (!config.lineTargetId) {
    throw new Error('LINE_TARGET_ID 未設定，請填入要推播的 userId、groupId 或 roomId。');
  }

  await client.pushMessage(config.lineTargetId, {
    type: 'text',
    text: message,
  });

  console.log('已發送摘要到 LINE:', config.lineTargetId);
}

module.exports = {
  sendSummary,
};
