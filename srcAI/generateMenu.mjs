/**
 * 生成樹狀選單結構
 */
import path from 'path'
import _ from 'lodash-es'
import { scanDirectory, pathToUrl } from './utils/fileUtils.mjs'

/**
 * 生成選單結構
 * @param {string} pagesDir - pages 資料夾路徑
 * @returns {Object} 選單結構
 */
export const generateMenuStructure = (pagesDir) => {
    const structure = scanDirectory(pagesDir, '')

    return {
        name: '網站導覽',
        children: structure
    }
}

/**
 * 生成選單 HTML
 * @param {Object} menu - 選單結構
 * @param {string} currentPath - 當前頁面路徑（用於高亮）
 * @param {string} rootPath - 根目錄相對路徑
 * @param {number} level - 層級深度
 * @returns {string} 選單 HTML
 */
export const generateMenuHtml = (menu, currentPath = '', rootPath = './', level = 0) => {
    if (!menu.children || menu.children.length === 0) {
        return ''
    }

    const isRoot = level === 0
    const ulClass = isRoot
        ? 'menu-root space-y-1'
        : 'menu-children ml-4 mt-1 space-y-1 hidden'

    let html = `<ul class="${ulClass}">\n`

    for (const item of menu.children) {
        const itemPath = pathToUrl(item.path)
        const href = item.isDir
            ? `${rootPath}${itemPath}/index.html`
            : `${rootPath}${itemPath.replace(/\.html$/, '')}.html`

        const isActive = currentPath === item.path
        const hasChildren = item.isDir && item.children && item.children.length > 0

        // 選單項目樣式
        // 優化配色：Active 使用淺藍背景+深藍邊框，使整體色系與 Header 的深灰藍更一致
        const itemClass = isActive
            ? 'menu-item active bg-primary-50 text-primary-900 font-bold border-l-4 border-primary-600'
            : 'menu-item text-slate-700 hover:bg-slate-50 hover:text-primary-700 border-l-4 border-transparent transition-colors'

        html += `  <li class="mb-1">\n`
        html += `    <div class="${itemClass} flex items-center rounded-r-md">\n`

        // 圖示顏色
        const iconColor = isActive ? 'text-primary-600' : 'text-slate-400'

        if (hasChildren) {
            // 有子項目：顯示展開/收合按鈕
            html += `      <button class="toggle-btn p-2 hover:bg-primary-100 rounded ${iconColor} hover:text-primary-700 transition-colors" onclick="toggleMenu(this)">\n`
            html += `        <i class="fas fa-chevron-right text-xs transition-transform duration-200"></i>\n`
            html += `      </button>\n`
        } else {
            // 無子項目：顯示文件圖示
            html += `      <span class="p-2">\n`
            html += `        <i class="fas fa-file-alt text-xs ${iconColor}"></i>\n`
            html += `      </span>\n`
        }

        html += `      <a href="${href}" class="flex-1 py-2 pr-3 block truncate" title="${item.displayName}">${item.displayName}</a>\n`
        html += `    </div>\n`

        // 遞迴生成子選單
        if (hasChildren) {
            html += generateMenuHtml(item, currentPath, rootPath, level + 1)
        }

        html += `  </li>\n`
    }

    html += `</ul>\n`

    return html
}

/**
 * 生成麵包屑導覽
 * @param {string} pagePath - 頁面相對路徑
 * @param {string} rootPath - 根目錄相對路徑
 * @returns {string} 麵包屑 HTML
 */
export const generateBreadcrumb = (pagePath, rootPath = './') => {
    const parts = pagePath.split(/[/\\]/).filter(Boolean)

    if (parts.length === 0) {
        return ''
    }

    let html = `<nav class="breadcrumb flex items-center text-sm text-slate-500 mb-4 flex-wrap">\n`
    html += `  <a href="${rootPath}index.html" class="hover:text-primary-600"><i class="fas fa-home leading-none"></i></a>\n`

    let currentPath = ''
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        currentPath = currentPath ? `${currentPath}/${part}` : part

        // 移除副檔名
        let displayName = part.replace(/\.html$/i, '')

        // 只有第一層（i === 0）才移除數字前綴
        if (i === 0) {
            displayName = displayName.replace(/^[\d]+[-.]/, '')
        }

        html += `  <span class="mx-2">/</span>\n`

        if (i === parts.length - 1) {
            // 最後一項不加連結
            html += `  <span class="text-slate-700 font-medium">${displayName}</span>\n`
        } else {
            // 資料夾連結
            html += `  <a href="${rootPath}${pathToUrl(currentPath)}/index.html" class="hover:text-primary-600">${displayName}</a>\n`
        }
    }

    html += `</nav>\n`

    return html
}

export default {
    generateMenuStructure,
    generateMenuHtml,
    generateBreadcrumb
}
