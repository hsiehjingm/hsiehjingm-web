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
    let html = `<h1 class="text-2xl font-bold text-primary-900 mb-6">${dirItem.displayName}</h1>\n`
    html += `<div class="directory-list">\n`

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
    let content = `<h1 class="text-2xl font-bold text-primary-900 mb-6">歡迎來到謝錦 文學與生命覺醒讀書會</h1>\n`
    content += `<p class="text-lg text-slate-600 mb-8">探索文學的力量，啟發生命的覺醒</p>\n`
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
