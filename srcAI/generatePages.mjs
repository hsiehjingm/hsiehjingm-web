/**
 * 生成各頁 HTML
 */
import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import { readFile, writeFile, ensureDir, pathToUrl, getRelativeToRoot } from './utils/fileUtils.mjs'
import { generateMenuHtml, generateBreadcrumb } from './generateMenu.mjs'
import { readAndProcessHtml, extractTitle } from './processHtml.mjs'

/**
 * 讀取模板檔案
 * @param {string} templatePath - 模板路徑
 * @returns {string} 模板內容
 */
const loadTemplate = (templatePath) => {
    return readFile(templatePath)
}

/**
 * 生成頂部導覽列
 * @param {Array} menuItems - 選單項目（第一層）
 * @param {string} rootPath - 根目錄相對路徑
 * @returns {string} 頂部導覽 HTML
 */
const generateTopNav = (menuItems, rootPath) => {
    let html = ''

    for (const item of menuItems) {
        const itemPath = pathToUrl(item.path)
        const href = item.isDir
            ? `${rootPath}${itemPath}/index.html`
            : `${rootPath}${itemPath.replace(/\.html$/, '')}.html`

        html += `<a href="${href}" class="text-primary-100 hover:text-white transition-colors font-medium">${item.displayName}</a>\n`
    }

    return html
}

/**
 * 生成目錄頁內容
 * @param {Object} dirItem - 目錄項目
 * @param {string} rootPath - 根目錄相對路徑
 * @returns {string} 目錄頁 HTML
 */
const generateDirectoryContent = (dirItem, rootPath) => {
    // 標題與控制工具列的容器
    let html = `<div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">\n`
    html += `  <h1 class="text-2xl font-bold text-primary-900 m-0">${dirItem.displayName}</h1>\n`

    // 格狀切換按鈕區
    html += `  <div class="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg" id="grid-controls-${dirItem.name}">\n`
    html += `    <button class="btn-grid active" data-cols="1" title="單欄顯示">\n`
    html += `      <i class="fas fa-list"></i>\n`
    html += `    </button>\n`
    html += `    <button class="btn-grid" data-cols="2" title="雙欄顯示">\n`
    html += `      <i class="fas fa-th-large"></i>\n`
    html += `    </button>\n`
    html += `    <button class="btn-grid" data-cols="3" title="三欄顯示">\n`
    html += `      <i class="fas fa-th"></i>\n`
    html += `    </button>\n`
    html += `  </div>\n`
    html += `</div>\n`

    // 目錄列表容器 (預設 1 欄)
    html += `<div id="dir-list-${dirItem.name}" class="directory-list grid-cols-1">\n`

    if (dirItem.children && dirItem.children.length > 0) {
        for (const child of dirItem.children) {
            const childPath = pathToUrl(child.path)
            const href = child.isDir
                ? `${rootPath}${childPath}/index.html`
                : `${rootPath}${childPath.replace(/\.html$/, '')}.html`

            const icon = child.isDir ? 'fa-folder' : 'fa-file-alt'

            html += `  <div class="directory-item">\n`
            html += `    <a href="${href}">\n`
            html += `      <i class="fas ${icon}"></i>\n`
            html += `      <span>${child.displayName}</span>\n`
            html += `    </a>\n`
            html += `  </div>\n`
        }
    } else {
        html += `  <p class="text-slate-500">此目錄暫無內容</p>\n`
    }

    html += `</div>\n`

    // 添加互動腳本 (每個目錄頁獨立)
    html += `<script>\n`
    html += `document.addEventListener('DOMContentLoaded', () => {\n`
    html += `    const container = document.getElementById('dir-list-${dirItem.name}');\n`
    html += `    const controls = document.getElementById('grid-controls-${dirItem.name}');\n`
    html += `    if (!container || !controls) return;\n`
    html += `\n`
    html += `    const btns = controls.querySelectorAll('.btn-grid');\n`
    html += `\n`
    html += `    // 更新按鈕狀態與可用性\n`
    html += `    const updateState = () => {\n`
    html += `        const width = window.innerWidth;\n`
    html += `        btns.forEach(btn => {\n`
    html += `            const cols = parseInt(btn.dataset.cols);\n`
    html += `            let disabled = false;\n`
    html += `            // RWD 邏輯\n`
    html += `            if (width < 640 && cols > 1) disabled = true;      // 手機: 僅 1 欄\n`
    html += `            if (width < 1024 && cols > 2) disabled = true;     // 平板: 最多 2 欄\n`
    html += `\n`
    html += `            btn.disabled = disabled;\n`
    html += `            if (disabled && btn.classList.contains('active')) {\n`
    html += `                // 若當前選中的被禁用，自動切回 1 欄\n`
    html += `                setColumns(1);\n`
    html += `            }\n`
    html += `        });\n`
    html += `    };\n`
    html += `\n`
    html += `    // 設定欄位\n`
    html += `    const setColumns = (n) => {\n`
    html += `        // 移除所有 grid-cols-* \n`
    html += `        container.classList.remove('grid-cols-1', 'grid-cols-2', 'grid-cols-3');\n`
    html += `        container.classList.add(\`grid-cols-\${n}\`);\n`
    html += `\n`
    html += `        // 更新按鈕樣式\n`
    html += `        btns.forEach(btn => {\n`
    html += `            if (parseInt(btn.dataset.cols) === n) btn.classList.add('active');\n`
    html += `            else btn.classList.remove('active');\n`
    html += `        });\n`
    html += `    };\n`
    html += `\n`
    html += `    // 綁定點擊事件\n`
    html += `    btns.forEach(btn => {\n`
    html += `        btn.addEventListener('click', () => {\n`
    html += `            if (!btn.disabled) setColumns(parseInt(btn.dataset.cols));\n`
    html += `        });\n`
    html += `    });\n`
    html += `\n`
    html += `    // 綁定視窗變動\n`
    html += `    window.addEventListener('resize', updateState);\n`
    html += `    updateState(); // 初始化\n`
    html += `});\n`
    html += `</script>\n`

    return html
}

/**
 * 套用模板生成頁面
 * @param {string} template - 模板內容
 * @param {Object} data - 頁面資料
 * @returns {string} 完整頁面 HTML
 */
const applyTemplate = (template, data) => {
    let html = template

    html = html.replace(/\{\{PAGE_TITLE\}\}/g, data.pageTitle || '')
    html = html.replace(/\{\{ROOT_PATH\}\}/g, data.rootPath || './')
    html = html.replace(/\{\{TOP_NAV\}\}/g, data.topNav || '')
    html = html.replace(/\{\{BREADCRUMB\}\}/g, data.breadcrumb || '')
    html = html.replace(/\{\{CONTENT\}\}/g, data.content || '')
    html = html.replace(/\{\{SIDEBAR_MENU\}\}/g, data.sidebarMenu || '')

    return html
}

/**
 * 遞迴生成所有頁面
 * @param {Object} options - 選項
 */
export const generateAllPages = (options) => {
    const {
        pagesDir,
        outputDir,
        templatePath,
        menuStructure,
        menuItems
    } = options

    const template = loadTemplate(templatePath)

    // 生成首頁
    generateHomePage(options, template)

    // 遞迴生成所有頁面
    processMenuItems(menuItems, options, template, '')
}

/**
 * 生成首頁
 */
const generateHomePage = (options, template) => {
    const { outputDir, menuStructure, menuItems } = options

    const rootPath = './'
    const topNav = generateTopNav(menuItems, rootPath)
    const sidebarMenu = generateMenuHtml(menuStructure, '', rootPath)

    // 首頁內容
    let content = `<h1 class="text-2xl font-bold text-primary-900 !mb-10">歡迎來到謝錦 文學與生命覺醒讀書會</h1>\n`

    content += `<div class="directory-list">\n`

    for (const item of menuItems) {
        const itemPath = pathToUrl(item.path)
        const href = item.isDir
            ? `${rootPath}${itemPath}/index.html`
            : `${rootPath}${itemPath.replace(/\.html$/, '')}.html`

        content += `  <div class="directory-item">\n`
        content += `    <a href="${href}">\n`
        content += `      <i class="fas fa-book-reader"></i>\n`
        content += `      <span>${item.displayName}</span>\n`
        content += `    </a>\n`
        content += `  </div>\n`
    }

    content += `</div>\n`

    const html = applyTemplate(template, {
        pageTitle: '首頁',
        rootPath: rootPath,
        topNav: topNav,
        breadcrumb: '',
        content: content,
        sidebarMenu: sidebarMenu
    })

    writeFile(path.join(outputDir, 'index.html'), html)
    console.log('已生成: index.html')
}

/**
 * 遞迴處理選單項目生成頁面
 */
const processMenuItems = (items, options, template, basePath) => {
    const { pagesDir, outputDir, menuStructure, menuItems } = options

    for (const item of items) {
        const currentPath = basePath ? `${basePath}/${item.name}` : item.name
        // 如果是目錄，index.html 位在目錄內，所以深度要加 1，這樣 getRelativeToRoot 才會返回正確的 ../ 回到根目錄
        const pathForDepth = item.isDir ? `${currentPath}/index.html` : currentPath
        const rootPath = getRelativeToRoot(pathForDepth)

        const topNav = generateTopNav(menuItems, rootPath)
        const sidebarMenu = generateMenuHtml(menuStructure, item.path, rootPath)
        const breadcrumb = generateBreadcrumb(item.path, rootPath)

        if (item.isDir) {
            // 目錄：生成 index.html
            const dirOutputPath = path.join(outputDir, pathToUrl(item.path))
            ensureDir(dirOutputPath)

            const content = generateDirectoryContent(item, rootPath)

            const html = applyTemplate(template, {
                pageTitle: item.displayName,
                rootPath: rootPath,
                topNav: topNav,
                breadcrumb: breadcrumb,
                content: content,
                sidebarMenu: sidebarMenu
            })

            writeFile(path.join(dirOutputPath, 'index.html'), html)
            console.log(`已生成: ${pathToUrl(item.path)}/index.html`)

            // 遞迴處理子項目
            if (item.children && item.children.length > 0) {
                processMenuItems(item.children, options, template, currentPath)
            }
        } else {
            // 檔案：生成對應頁面
            const srcPath = path.join(pagesDir, item.path)
            const outputName = item.name.replace(/\.html$/i, '') + '.html'
            const outputPath = path.join(outputDir, path.dirname(pathToUrl(item.path)), outputName)

            const { content: processedContent, title } = readAndProcessHtml(srcPath)

            const html = applyTemplate(template, {
                pageTitle: title || item.displayName,
                rootPath: rootPath,
                topNav: topNav,
                breadcrumb: breadcrumb,
                content: processedContent || `<p>內容載入中...</p>`,
                sidebarMenu: sidebarMenu
            })

            ensureDir(path.dirname(outputPath))
            writeFile(outputPath, html)
            console.log(`已生成: ${pathToUrl(item.path).replace(/\.html$/, '')}.html`)
        }
    }
}

export default {
    generateAllPages
}
