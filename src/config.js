const dotenv = require('dotenv');
dotenv.config({ path: process.env.ENV_PATH || '.env.local' });

const parseBoolean = (value) => String(value).toLowerCase() === 'true';

const config = {
  youtubeRssUrl: process.env.YT_RSS_URL || 'https://www.youtube.com/feeds/videos.xml?channel_id=UCIicAlXlv874Rp9LVfGOJfA',
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
      apiUrl: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    },
    deepseek: {
      name: 'DeepSeek',
      type: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.ai/v1/generate',
    },
  },
  dryRun: parseBoolean(process.env.DRY_RUN || 'true'),
};

module.exports = config;
