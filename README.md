# yttracker

A Node.js script that fetches YouTube news from TVBS RSS, filters for tech-related content, and sends summaries to LINE using multiple AI providers in fallback order.

## 目標

- 每天抓一次 TVBS YouTube 新聞頻道 RSS（15 篇影片）
- 一次將全部影片傳給 AI provider
- 先嘗試 Gemini，若失敗則輪詢 DeepSeek
- 讓 AI 判斷是否科技相關，並生成大綱
- 只將科技相關影片的名稱、網址、大綱傳送到 LINE
- 可放在 GitHub Actions 定時執行

## 專案結構

```
yttracker/
├── src/
│   ├── index.js
│   ├── config.js
│   └── services/
│       ├── youtubeRss.js      # 抓 TVBS RSS
│       ├── summarizer.js      # Gemini 過濾 + 生成大綱
│       └── lineNotifier.js    # 發送到 LINE
├── .github/workflows/daily-news.yml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 安裝

```bash
npm install
```

## 本地測試

1. 複製 `.env.example` 為 `.env.local`
2. 填入你的：
   - `AI_PROVIDER_ORDER` - AI provider 的輪詢順序，例如 `gemini,deepseek`
   - `GEMINI_API_KEY` - 你的 Gemini API key
   - `GEMINI_API_URL` - Gemini API endpoint（若你要自訂）
   - `DEEPSEEK_API_KEY` - 你的 DeepSeek API key
   - `DEEPSEEK_API_URL` - DeepSeek API endpoint（若你要自訂）
   - `LINE_CHANNEL_ACCESS_TOKEN` - 你的 LINE Bot token
   - `LINE_TARGET_ID` - 要接收訊息的 LINE ID
3. 保留 `DRY_RUN=true`，先測試流程不會真的發送 LINE 訊息
4. 執行：

```bash
npm start
```

輸出範例（DRY_RUN=true）：
```
取得 15 支最新影片，分析中...
=== DRY RUN 模式 ===
影片名稱：AI 新突破...
影片連結：https://...
大綱：...

---

...
=== 結束 ===
```

## GitHub Actions

- 工作流檔案：`.github/workflows/daily-news.yml`
- 預設每天 UTC 00:00 執行一次，可依需求調整
- 將必要的值設成 GitHub Secrets：
  - `GEMINI_API_KEY`
  - `LINE_CHANNEL_ACCESS_TOKEN`
  - `LINE_TARGET_ID`

## 說明

- `src/index.js` 負責執行流程
- `src/services/youtubeRss.js` 抓取 TVBS YouTube 最新 15 支影片的 RSS
- `src/services/summarizer.js` 一次將全部影片傳給 Gemini，讓它判斷科技相關並生成大綱
- `src/services/lineNotifier.js` 將結果推送到 LINE，`DRY_RUN=true` 時改為在終端機印出
