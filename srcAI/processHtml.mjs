/**
 * HTML 內容處理與轉換
 */
import fs from 'fs'
import path from 'path'
import _ from 'lodash-es'
import w from 'wsemi'
import * as cheerio from 'cheerio'
import { readFile } from './utils/fileUtils.mjs'

/**
 * 處理 HTML 內容
 * @param {string} htmlContent - 原始 HTML 內容
 * @param {Object} options - 處理選項
 * @returns {string} 處理後的 HTML
 */
export const processHtmlContent = (htmlContent, options = {}) => {
    if (!htmlContent || !w.isestr(htmlContent)) {
        return ''
    }

    // 使用 cheerio 解析 HTML
    const $ = cheerio.load(htmlContent, {
        decodeEntities: false,
        xmlMode: false
    })

    // 處理圖片：確保有適當的樣式
    $('img').each((i, el) => {
        const $img = $(el)

        // 添加響應式樣式
        $img.addClass('max-w-full h-auto my-4')

        // 如果沒有 alt 屬性，添加空 alt
        if (!$img.attr('alt')) {
            $img.attr('alt', '')
        }
    })

    // 處理連結：外部連結添加 target="_blank"
    $('a').each((i, el) => {
        const $a = $(el)
        const href = $a.attr('href') || ''

        if (href.startsWith('http://') || href.startsWith('https://')) {
            $a.attr('target', '_blank')
            $a.attr('rel', 'noopener noreferrer')
        }
    })

    // 處理表格：添加響應式包裝
    $('table').each((i, el) => {
        const $table = $(el)
        $table.addClass('w-full border-collapse my-4')

        // 添加表格樣式
        $table.find('th, td').addClass('border border-slate-300 px-3 py-2')
        $table.find('th').addClass('bg-slate-100 font-semibold')
    })

    return $.html()
}

/**
 * 從 HTML 內容提取標題
 * @param {string} htmlContent - HTML 內容
 * @returns {string} 標題
 */
export const extractTitle = (htmlContent) => {
    if (!htmlContent) {
        return ''
    }

    const $ = cheerio.load(htmlContent, {
        decodeEntities: false
    })

    // 嘗試從 h1, h2, 或第一個 p 標籤取得標題
    let title = $('h1').first().text().trim()

    if (!title) {
        title = $('h2').first().text().trim()
    }

    if (!title) {
        // 嘗試從第一個 p 標籤中的粗體文字取得
        title = $('p b, p strong').first().text().trim()
    }

    if (!title) {
        title = $('p').first().text().trim()
    }

    // 限制標題長度
    if (title && title.length > 50) {
        title = title.substring(0, 50) + '...'
    }

    return title
}

/**
 * 讀取並處理 HTML 檔案
 * @param {string} filePath - 檔案路徑
 * @param {Object} options - 處理選項
 * @returns {Object} { content, title }
 */
export const readAndProcessHtml = (filePath, options = {}) => {
    const content = readFile(filePath)

    if (!content) {
        return { content: '', title: '' }
    }

    const processedContent = processHtmlContent(content, options)
    const title = extractTitle(content)

    return {
        content: processedContent,
        title: title
    }
}

export default {
    processHtmlContent,
    extractTitle,
    readAndProcessHtml
}
