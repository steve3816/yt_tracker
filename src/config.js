const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: process.env.ENV_PATH || '.env.local' });

const parseBoolean = (value) => String(value).toLowerCase() === 'true';

const channels = require(path.join(__dirname, '..', 'channels.json'));
const taskKeys = (process.env.TASK || '').split(',').map((k) => k.trim()).filter(Boolean);
if (!taskKeys.length) throw new Error('TASK 未設定，請在 .env.local 指定要執行的任務');
const tasks = taskKeys.map((key) => {
  const task = channels[key];
  if (!task) throw new Error(`找不到任務 "${key}"，請確認 channels.json 中有此設定`);
  return { ...task, youtubeRssUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${task.channelId}` };
});

const config = {
  tasks,
  lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  lineTargetId: process.env.LINE_TARGET_ID || '',
  aiProviderOrder: (process.env.AI_PROVIDER_ORDER || 'gemini,deepseek')
    .split(',')
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean),
  aiProviders: {
    gemini: {
      name: 'Gemini',
      type: 'gemini',
      apiKey: process.env.GEMINI_API_KEY || '',
      apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    },
    deepseek: {
      name: 'DeepSeek',
      type: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      // baseURL 由 aiClient.js 的 OpenAI SDK 初始化時直接指定，不需要在此設定
    },
  },
  dryRun: parseBoolean(process.env.DRY_RUN || 'true'),
};

module.exports = config;
