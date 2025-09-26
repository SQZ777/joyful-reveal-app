# 🍼 驚喜揭曉網頁

一個密碼保護的驚喜揭曉頁面，用於向朋友和家人公布驚喜好消息。

## 📱 功能特色

- 🔐 密碼保護機制（SHA-256 雜湊）
- 📱 Mobile First 響應式設計
- 🎉 彩帶慶祝動畫
- 🔍 圖片點擊放大功能
- 💫 流暢的動畫效果
- ♿ 基本無障礙支援

## 🚀 快速開始

### 1. 設定密碼

首先產生您的密碼雜湊值：

```bash
npm run generate-hash
```

將產生的雜湊值複製到 `src/main.js` 中的 `CONFIG.PASS_HASH`。

### 2. 替換圖片

將您的超音波照片放在 `public/images/` 目錄中，並命名為 `ultrasound.jpg`，或者修改 `reveal.html` 中的圖片路徑。

### 3. 自訂文案

在 `reveal.html` 中修改以下內容：
- 主標題文案
- 祝福文案
- 預計出生時間

### 4. 本地測試

```bash
npm install
npm run dev
```

在瀏覽器中開啟 `http://localhost:3000` 進行測試。

## 🛠 檔案結構

```
joyful-reveal-app/
├── index.html              # 密碼輸入頁面
├── reveal.html             # 揭曉頁面
├── src/
│   ├── main.js            # 主要邏輯程式碼
│   ├── confetti.js        # 彩帶動畫
│   └── styles.css         # 樣式檔案
├── public/
│   └── images/
│       └── ultrasound.svg # 範例圖片（請替換）
├── scripts/
│   └── generate-hash.js   # 密碼雜湊產生器
├── package.json
├── vercel.json            # Vercel 部署設定
└── README.md
```

## 🎨 自訂選項

在 `src/main.js` 中的 `CONFIG` 物件：

```javascript
const CONFIG = {
    PASS_HASH: 'your-password-hash',  // 密碼雜湊值
    ENABLE_CONFETTI: true,            // 啟用彩帶動畫
    REVEAL_IMAGE_URL: 'public/images/ultrasound.jpg'  // 圖片路徑
};
```

## 🚀 部署

### 其他靜態託管服務

- **Netlify**: 直接拖拽專案資料夾
- **GitHub Pages**: 推送到 `gh-pages` 分支
- **Firebase Hosting**: 使用 Firebase CLI 部署

## 🔒 安全性考量

- 密碼以 SHA-256 雜湊形式儲存，不在前端暴露明文
- 僅適用於一次性活動，不建議長期使用
- 技術使用者仍可能透過原始碼逆向工程

## 📱 瀏覽器支援

- iOS Safari 12+
- Android Chrome 70+
- Desktop Chrome/Firefox/Safari 最新版本

## 🧪 測試檢查清單

- [ ] 正確密碼能成功解鎖
- [ ] 錯誤密碼顯示錯誤訊息
- [ ] 手機端輸入和顯示正常
- [ ] 圖片點擊放大功能
- [ ] 彩帶動畫正常播放
- [ ] 直接訪問 `/reveal` 會被導回首頁
- [ ] 各種螢幕尺寸顯示正確

## 📝 使用說明

### 設定步驟

1. **產生密碼雜湊**: `npm run generate-hash`
2. **更新設定**: 修改 `src/main.js` 中的 `CONFIG.PASS_HASH`
3. **替換圖片**: 將超音波照片放在 `public/images/ultrasound.jpg`
4. **自訂文案**: 修改 `reveal.html` 中的文字內容
5. **測試功能**: `npm run dev` 並在各裝置測試
6. **部署上線**: 推送到 Vercel 或其他靜態託管服務

### 分享方式

部署完成後，將網址分享給朋友和家人，告訴他們密碼，讓他們自己解鎖驚喜！

## 🎉 使用範例

「嗨！我們有個小驚喜要與你分享 💕 請點擊連結並輸入密碼『我們的紀念日』來解鎖秘密：[您的網址]」

## 📄 授權

MIT License - 歡迎自由使用和修改。

## 🙋‍♂️ 支援

如有問題或建議，請建立 Issue 或直接聯繫專案維護者。

---
