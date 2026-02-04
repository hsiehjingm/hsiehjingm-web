# 謝錦 文學與生命覺醒讀書會 - 網站專案

本專案為「謝錦 文學與生命覺醒讀書會」的官方靜態網站原始碼。網站採用自製的靜態網站產生器 (Static Site Generator) 建置，將大量的 HTML 片段轉換為具備完整導覽功能的多頁式網站 (MPA)。

**網站網址**：[https://hsiehjingm.github.io/hsiehjingm-web/](https://hsiehjingm.github.io/hsiehjingm-web/)

## 🛠️ 技術核心

本專案不使用現成的框架（如 Hugo, Hexo），而是使用 Node.js 客製化開發建置腳本，以符合高度客製化的目錄結構需求。

- **核心語言**：Node.js (ES6 Modules)
- **建置工具**：自製腳本 (`srcAI/build.mjs`)
- **樣式框架**：[Tailwind CSS](https://tailwindcss.com/) (CDN)
- **圖示庫**：[Font Awesome 6](https://fontawesome.com/) (CDN)
- **部署平台**：GitHub Pages (透過 GitHub Actions 自動部署)

## 📂 專案架構

- **`pages/`**：原始資料來源。包含數千個 HTML 片段，依照資料夾結構分類（如：1.謝錦, 2.著作...）。這些檔案僅包含內容部分，不含 `<head>` 或 `<body>`。
- **`srcAI/`**：核心建置程式碼。
    - `build.mjs`：主建置腳本入口。
    - `generateMenu.mjs`：掃描 `pages` 目錄並生成樹狀選單結構。
    - `generatePages.mjs`：讀取 HTML 片段，套用模板 (`layout.html`)，並注入選單與樣式。
    - `templates/`：包含網頁主模板 (`layout.html`) 與樣式定義。
- **`web/`**：(自動產生) 建置完成的靜態網站輸出目錄。此目錄即為最終發佈的網站內容。
- **`.github/workflows/deploy.yml`**：GitHub Actions 設定檔，負責自動將 `web/` 目錄部署至 GitHub Pages。

## 🚀 開發與建置流程

1.  **安裝依賴**
    ```bash
    npm install
    ```

2.  **執行建置**
    執行此指令後，程式會讀取 `pages/` 內容，並將完整網站生成至 `web/` 目錄。
    ```bash
    node srcAI/build.mjs
    ```

3.  **本地預覽**
    建置完成後，可使用任何 HTTP Server 預覽 `web/` 目錄。
    ```bash
    cd web
    python3 -m http.server 8080
    ```

## ⚙️ 自動部署

本專案已設定 **GitHub Actions**。
只要將程式碼 Push 到 `main` 分支，GitHub Actions 會自動偵測變更，並將 `web/` 資料夾的內容發佈到 GitHub Pages。

---
*© 謝錦 文學與生命覺醒讀書會*
