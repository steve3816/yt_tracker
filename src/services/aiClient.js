const axios = require('axios');
const config = require('../config');

async function callGemini(provider, prompt) {
  try {
    console.log(`Gemini 請求 URL: ${provider.apiUrl}`);
    console.log(`Gemini API Key 前綴: ${provider.apiKey.substring(0, 10)}...`);

    const response = await axios.post(
      provider.apiUrl,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        params: {
          key: provider.apiKey,
        },
        timeout: 30000,
      }
    );

    console.log('Gemini 原始回應：', JSON.stringify(response.data, null, 2));
    const candidates = response.data?.candidates;
    if (!candidates || !candidates.length) {
      throw new Error('Gemini 回傳格式異常');
    }

    const content = candidates[0].content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('Gemini 回傳內容為空');
    }

    return content.trim();
  } catch (error) {
    console.error('Gemini 請求失敗：');
    console.error('錯誤訊息:', error.message);
    console.error('HTTP 狀態碼:', error.response?.status);
    console.error('回應資料:', error.response?.data);
    console.error('請求 URL:', error.config?.url);
    throw error;
  }
}

async function callDeepSeek(provider, prompt) {
  const response = await axios.post(
    provider.apiUrl,
    {
      prompt,
    },
    {
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const text = response.data?.result || response.data?.text || response.data?.output || response.data?.content;
  if (!text) {
    throw new Error('DeepSeek 回傳格式異常');
  }

  return String(text).trim();
}

async function callProvider(providerName, prompt) {
  const provider = config.aiProviders[providerName];
  if (!provider) {
    throw new Error(`找不到 AI provider: ${providerName}`);
  }

  if (!provider.apiKey) {
    throw new Error(`${provider.name} API key 未設定`);
  }

  switch (provider.type) {
    case 'gemini':
      return await callGemini(provider, prompt);
    case 'deepseek':
      return await callDeepSeek(provider, prompt);
    default:
      throw new Error(`未知的 provider type: ${provider.type}`);
  }
}

async function callAIProviders(prompt) {
  const errors = [];

  for (const providerName of config.aiProviderOrder) {
    try {
      console.log(`嘗試使用 AI provider：${providerName}`);
      const provider = config.aiProviders[providerName];
      if (!provider) {
        errors.push(`${providerName} 未在設定中註冊`);
        continue;
      }
      if (!provider.apiKey) {
        console.warn(`跳過 ${providerName}：API key 未設定`);
        errors.push(`${providerName} API key 未設定`);
        continue;
      }

      const result = await callProvider(providerName, prompt);
      console.log(`使用 ${providerName} 成功。`);
      return result;
    } catch (error) {
      console.warn(`${providerName} 失敗：${error.message}`);
      errors.push(`${providerName} 失敗：${error.message}`);
    }
  }

  throw new Error(`所有 AI provider 均失敗：${errors.join('; ')}`);
}

module.exports = {
  callAIProviders,
};
