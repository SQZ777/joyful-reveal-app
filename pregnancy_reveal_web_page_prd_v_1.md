# 📄 Product Requirement Document (PRD)
**專案名稱**：Pregnancy Reveal Web Page  
**版本**：v1.0  
**負責人**：張少齊（Product Owner）  
**目標上線**：一次性活動頁，於公布當日（T-0）前完成並驗收  
**語系**：zh-TW  
**裝置**：Mobile First（支援桌機/平板）

---

## 1. 目標與成效
**目標**：以密碼解鎖方式，向受邀朋友揭露老婆懷孕的超音波照，營造驚喜感。  
**成功指標（一次性）**：
- 受邀者可於手機端順利輸入密碼並看到照片（成功率 ≥ 99%）。
- 平均解鎖時間 < 10 秒（進站→輸入密碼→解鎖）。
- 錯誤密碼提示清楚，誤觸率（連續 3 次以上錯誤） < 5%。

---

## 2. 使用者與情境
- **受邀朋友**：取得連結→進站→輸入密碼→解鎖→觀看照片與祝福文案。  
- **產品擁有者（你）**：設定密碼、指定要顯示之超音波照（單張為主，可擴展多張）。

**主要情境**：
1. 使用者進站，看到「輸入密碼解鎖」頁面。
2. 輸入密碼後按下確認。
3. 若密碼正確：呈現超音波照、祝福文案與可選彩帶動畫（confetti）。
4. 若密碼錯誤：顯示錯誤訊息，不顯示照片。

---

## 3. 功能需求（FRD）
### 3.1 頁面結構
- **/（Home）**：
  - 標題（Ex:「輸入密碼解鎖秘密 🔐」）。
  - 密碼輸入框（type=password）。
  - 送出按鈕。
  - 錯誤提示區（僅在錯誤時顯示）。
- **/reveal（成功解鎖頁）**：
  - 超音波照片展示（支援 pinch-to-zoom 或點擊放大）。
  - 祝福文案（可客製）。
  - 選用：彩帶動畫（可開關）。
  - 選用：再看一次/返回按鈕。

### 3.2 密碼驗證（兩種實作路線）
- **A. 純前端（簡單快速）**
  - 密碼在前端程式中以 **雜湊**（例如 SHA-256）形式保存。
  - 使用者輸入密碼後在瀏覽器端雜湊，與保存的雜湊值比對。
  - 風險：技術使用者可逆向流程（但對一次性活動足夠）。
- **B. 輕後端 API（較安全）**
  - POST `/api/verify`，Body: `{ password: string }`。
  - 後端比對環境變數中密碼（或密碼雜湊），回傳 200/401。
  - 前端僅依成功回應導向 `/reveal`，不在前端保存密碼或雜湊。

### 3.3 圖片管理
- 以一張超音波照為主，可擴展為多張（輪播）。
- 需求：圖片壓縮與自適應（最大寬度 100%，lazy-load）。
- 來源：
  - 靜態資源（/public/images/ultrasound.jpg），或
  - CDN/雲端（需公開 URL）。

### 3.4 文案與本地化
- **密碼頁**：
  - 標題：`輸入密碼解鎖秘密 🔐`
  - 佈局說明：簡潔、集中注意力於輸入框。
  - 錯誤提示：`密碼錯誤，請再試一次。`
- **揭曉頁**：
  - 主文案：`驚喜！我們要當爸媽了 👶💖`
  - 副文案（可選）：`謝謝你們的祝福與陪伴。`

### 3.5 可用性與無障礙
- Mobile First，支援 iOS/Android 主流瀏覽器。
- 元件具備基本 ARIA 標籤（表單、錯誤提示）。
- 對比度與字級（14px 以上），可鍵盤操作。

---

## 4. 非功能需求（NFR）
- **效能**：首頁首次載入 ≤ 200KB（不含圖片）；圖片以壓縮與適應載入策略。
- **可靠性**：頁面可離線顯示首頁（若使用純前端）；API 方案需 99% 可用性（Vercel/Render）。
- **安全**：
  - 純前端：密碼以雜湊儲存；LocalStorage 僅保存臨時會話旗標（非必要可不存）。
  - 後端：密碼/雜湊存於環境變數；API 有速率限制（如 10 req/min/IP）。
- **隱私**：無個資收集；不串 GA；可選擇簡單計數器（PV/解鎖數）。

---

## 5. 系統設計與規格
### 5.1 前端技術（建議）
- 純 HTML/CSS/JS（一次性最快）或使用 Vite + Vanilla TS。
- 樣式：Tailwind 或輕量原生 CSS。
- 動畫：CSS/Canvas confetti（可套用 micro-lib）。

### 5.2 後端技術（可選）
- Node.js + Express / Vercel Edge Function。
- API 規格：
  - `POST /api/verify`
    - **Request**: `{ password: string }`
    - **Response**: `200 OK { ok: true }` / `401 { ok: false, message: "invalid" }`
    - **Security**: 環境變數 `REVEAL_PASS`（或 `REVEAL_PASS_HASH`）。
    - **Rate Limit**: 以 IP 為單位，10 req/min。

### 5.3 路由與導向流程
```text
/  --輸入密碼-->  驗證（前端或 API）  --成功-->  /reveal
                                   \--失敗-->  顯示錯誤訊息（停留在 /）
```

### 5.4 狀態管理
- 純前端：
  - 成功後以 `sessionStorage.setItem('unlocked', '1')` 標記；
  - `/reveal` 需檢查該旗標，否則導回 `/`。
- 後端：
  - 成功後以 **HTTP-only Cookie**（短期 10 分鐘）紀錄；
  - `/reveal` 伺服器端驗證 Cookie（若 Edge/SSR）。

### 5.5 檔案與環境
- **目錄建議**：
```
project-root/
  public/
    images/
      ultrasound.jpg
  src/
    index.html
    styles.css
    main.js
    reveal.html
  api/ (可選, 後端)
    verify.ts
```
- **環境變數（後端方案）**：
  - `REVEAL_PASS` 或 `REVEAL_PASS_HASH`
  - `RATE_LIMIT`（可選）

---

## 6. 驗收與測試案例（UAT）
- **UAT-001**：正確密碼 → 跳轉至 `/reveal`，顯示圖片與文案。
- **UAT-002**：錯誤密碼 → 留在 `/`，顯示 `密碼錯誤` 提示。
- **UAT-003**：Mobile（iOS Safari / Android Chrome）輸入與放大縮放正常。
- **UAT-004**：連續錯誤 3 次仍可繼續嘗試（無鎖死，但若後端有 rate limit，顯示溫和提示）。
- **UAT-005**：直接訪問 `/reveal`（未解鎖）→ 導回 `/`。
- **UAT-006**：圖片自適應；橫向/縱向切換不變形。
- **UAT-007**（後端）API 不回洩露具體密碼資訊；401 僅回傳 `invalid`。
- **UAT-008**：彩帶動畫可開關；不影響頁面操作。

---

## 7. 內容與素材
- 圖片：`ultrasound.jpg`（建議 150~300KB, 1920px 寬內）。
- 文案可自訂：
  - 主文（H1）：`驚喜！我們要當爸媽了 👶💖`
  - 副文（P）：`謝謝你們的祝福與陪伴。`
- Favicon（可選）：簡單愛心或寶寶圖示。

---

## 8. 風險與緩解
- **密碼被看原始碼逆向**（前端方案）：接受風險或改用後端驗證。
- **連結外流**：加密碼已降低風險；可於活動後下架頁面。
- **裝置相容性**：採原生能力與簡單 CSS，降低相容性問題。

---

## 9. 部署與下線流程
- **部署**：Vercel / Netlify / GitHub Pages（純前端）。若用後端，Vercel Functions。
- **驗收清單**：
  - [ ] 主要瀏覽器手機端測試
  - [ ] 圖片清晰、載入快速
  - [ ] 密碼驗證正確
  - [ ] 直接訪問 `/reveal` 會被導回
  - [ ] 彩帶動畫（如啟用）表現正常
- **活動後**：將專案存檔或下架（改 404 或設置 `unpublished`）。

---

## 10. AI Agent 實作任務（Work Items）
> 下列為可直接派發的任務卡（User Story / Task），AI Agent 依序完成。

### US-1：作為朋友，我希望在手機上輸入密碼後即可看到驚喜照片
- AC：見 UAT-001~006。

### T-1：建立專案骨架（純前端版本）
- 產出：`index.html`, `reveal.html`, `styles.css`, `main.js`, `public/images/ultrasound.jpg`（預留）。
- 在 `main.js` 實作：
  - 讀取輸入值→SHA-256 雜湊→與常數 `PASS_HASH` 比對。
  - 成功：`sessionStorage.unlocked = '1'` 並導向 `/reveal`。
  - 失敗：顯示錯誤訊息。
- 在 `reveal.html`：進入檢查 `sessionStorage.unlocked`，否則導回 `/`。

### T-2：樣式與動畫
- Mobile First：輸入框、按鈕、錯誤提示、圖片容器。
- 加入可切換的 confetti 動畫（flag 控制）。

### T-3：圖片最佳化
- 加入 `img` 的 `loading="lazy"`，容器 `max-width: 100%`。
- 點擊放大（簡易 CSS 或輕量 JS）。

### T-4（可選）：後端 API 驗證方案
- 新增 `api/verify.ts`（Vercel）或 `server.js`（Express）。
- 比對 `process.env.REVEAL_PASS`（或雜湊）。
- 成功後以 Set-Cookie（HttpOnly, Max-Age=600）回傳。
- `/reveal` 於 SSR/Edge 驗證 Cookie，否則 302 回 `/`。

### T-5：部署與驗收
- 佈署至 Vercel/Netlify/GitHub Pages。
- 依「驗收清單」逐項勾選。

---

## 11. 參數化與設定
- `PASS_HASH`（前端方案）：由明文密碼經 SHA-256 產生（建置腳本處理）。
- `ENABLE_CONFETTI`：true/false。
- `REVEAL_IMAGE_URL`：圖片路徑。
- `REVEAL_COPY_H1`, `REVEAL_COPY_P`：文案字串。

---

## 12. 時程建議（理想工時）
- T-1 專案與驗證流程：2 小時  
- T-2 樣式與動畫：1 小時  
- T-3 圖片與相容性：0.5 小時  
- T-5 佈署與 UAT：0.5 小時  
> **合計**：~4 小時（純前端）。

---

## 13. 後續擴充（非本版）
- 多張照片輪播、BGM、留言牆（需防濫用）、訪客計數、到期自動關閉。

---

### 🔧 附錄：前端雜湊比對（偽碼）
```js
// build 時產生 PASS_HASH：
// echo -n "<YourPassword>" | shasum -a 256
const PASS_HASH = '<sha256-hex>'

async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

async function onSubmit(pw) {
  const h = await sha256Hex(pw)
  if (h === PASS_HASH) {
    sessionStorage.setItem('unlocked', '1')
    location.href = '/reveal'
  } else {
    showError('密碼錯誤，請再試一次。')
  }
}
```

