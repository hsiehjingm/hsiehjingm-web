/**
 * 檔案操作工具函式
 */
import fs from 'fs'
import path from 'path'
import _ from 'lodash-es'
import w from 'wsemi'

/**
 * 遞迴取得資料夾內所有 .html 檔案
 * @param {string} dirPath - 資料夾路徑
 * @param {string} basePath - 基礎路徑（用於計算相對路徑）
 * @returns {Array} 檔案/資料夾結構陣列
 */
export const scanDirectory = (dirPath, basePath = '', level = 0) => {
    const items = []

    if (!fs.existsSync(dirPath)) {
        return items
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    // 排序：使用自然排序（數字前綴依數值排序，解決 10 排在 2 前面的問題）
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
    const sortedEntries = entries.sort((a, b) => collator.compare(a.name, b.name))

    for (const entry of sortedEntries) {
        const fullPath = path.join(dirPath, entry.name)
        const relativePath = path.join(basePath, entry.name)

        if (entry.isDirectory()) {
            // 遞迴處理子資料夾，層級加 1
            const children = scanDirectory(fullPath, relativePath, level + 1)
            if (children.length > 0) {
                items.push({
                    name: entry.name,
                    displayName: extractDisplayName(entry.name, level),
                    path: relativePath,
                    isDir: true,
                    children: children
                })
            }
        } else if (entry.isFile() && entry.name.endsWith('.html') && !entry.name.endsWith('-conv.txt')) {
            // 只處理 .html 檔案，排除 -conv.txt
            items.push({
                name: entry.name,
                displayName: extractDisplayName(entry.name, level),
                path: relativePath,
                isDir: false
            })
        }
    }

    return items
}

/**
 * 從檔名提取顯示名稱（去除數字前綴與副檔名）
 * @param {string} filename - 檔案名稱
 * @returns {string} 顯示名稱
 */
export const extractDisplayName = (filename, level = 0) => {
    // 移除副檔名
    let name = filename.replace(/\.html$/i, '')

    // 只有第一層（level === 0）才移除開頭的數字前綴（如 "1." 或 "1-1"）
    // 第二層以下保留數字前綴
    if (level === 0) {
        name = name.replace(/^[\d]+[-.]/, '')
    }

    return name || filename
}

/**
 * 確保目錄存在
 * @param {string} dirPath - 目錄路徑
 */
export const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
}

/**
 * 複製檔案
 * @param {string} src - 來源路徑
 * @param {string} dest - 目標路徑
 */
export const copyFile = (src, dest) => {
    ensureDir(path.dirname(dest))
    fs.copyFileSync(src, dest)
}

/**
 * 寫入檔案
 * @param {string} filePath - 檔案路徑
 * @param {string} content - 檔案內容
 */
export const writeFile = (filePath, content) => {
    ensureDir(path.dirname(filePath))
    fs.writeFileSync(filePath, content, 'utf8')
}

/**
 * 讀取檔案
 * @param {string} filePath - 檔案路徑
 * @returns {string} 檔案內容
 */
export const readFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
        return ''
    }
    return fs.readFileSync(filePath, 'utf8')
}

/**
 * 清空目錄（保留目錄本身）
 * @param {string} dirPath - 目錄路徑
 */
export const cleanDir = (dirPath) => {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true })
    }
    ensureDir(dirPath)
}

/**
 * 將路徑轉換為 URL 格式（使用 /）
 * @param {string} filePath - 檔案路徑
 * @returns {string} URL 格式路徑
 */
export const pathToUrl = (filePath) => {
    return filePath.replace(/\\/g, '/')
}

/**
 * 計算從某頁面到根目錄的相對路徑
 * @param {string} pagePath - 頁面相對路徑
 * @returns {string} 到根目錄的相對路徑
 */
export const getRelativeToRoot = (pagePath) => {
    const depth = (pagePath.match(/[/\\]/g) || []).length
    if (depth === 0) {
        return './'
    }
    return '../'.repeat(depth)
}

export default {
    scanDirectory,
    extractDisplayName,
    ensureDir,
    copyFile,
    writeFile,
    readFile,
    cleanDir,
    pathToUrl,
    getRelativeToRoot
}
