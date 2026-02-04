/**
 * 主建置程式入口
 * 將 ./pages 資料夾內的 HTML 內容轉換成多頁靜態網站
 */
import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import { cleanDir, ensureDir, writeFile, readFile, copyFile } from './utils/fileUtils.mjs'
import { generateMenuStructure } from './generateMenu.mjs'
import { generateAllPages } from './generatePages.mjs'

// 路徑設定
const ROOT_DIR = process.cwd()
const PAGES_DIR = path.join(ROOT_DIR, 'pages')
const OUTPUT_DIR = path.join(ROOT_DIR, 'web')
const SRC_AI_DIR = path.join(ROOT_DIR, 'srcAI')
const TEMPLATE_PATH = path.join(SRC_AI_DIR, 'templates', 'layout.html')

/**
 * 複製靜態資源
 */
const copyStaticAssets = () => {
    console.log('\n📦 複製靜態資源...')

    // 複製 CSS
    const cssSource = path.join(SRC_AI_DIR, 'templates', 'style.css')
    const cssDest = path.join(OUTPUT_DIR, 'css', 'style.css')
    copyFile(cssSource, cssDest)
    console.log('已複製: css/style.css')

    // 複製 JS
    const jsSource = path.join(SRC_AI_DIR, 'templates', 'menu.js')
    const jsDest = path.join(OUTPUT_DIR, 'js', 'menu.js')
    copyFile(jsSource, jsDest)
    console.log('已複製: js/menu.js')

    // 複製 img 資料夾（如果存在）
    const imgSource = path.join(ROOT_DIR, 'img')
    const imgDest = path.join(OUTPUT_DIR, 'img')
    if (fs.existsSync(imgSource)) {
        copyDirectory(imgSource, imgDest)
        console.log('已複製: img/')
    }
}

/**
 * 遞迴複製目錄
 */
const copyDirectory = (src, dest) => {
    ensureDir(dest)
    const entries = fs.readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath)
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    }
}

/**
 * 主建置流程
 */
const build = async () => {
    console.log('🚀 開始建置網站...')
    console.log(`📂 來源目錄: ${PAGES_DIR}`)
    console.log(`📂 輸出目錄: ${OUTPUT_DIR}`)

    // 檢查 pages 目錄是否存在
    if (!fs.existsSync(PAGES_DIR)) {
        console.error('❌ 錯誤: pages 目錄不存在')
        process.exit(1)
    }

    // 清空輸出目錄
    console.log('\n🗑️  清空輸出目錄...')
    cleanDir(OUTPUT_DIR)
    ensureDir(path.join(OUTPUT_DIR, 'css'))
    ensureDir(path.join(OUTPUT_DIR, 'js'))

    // 複製靜態資源
    copyStaticAssets()

    // 生成選單結構
    console.log('\n📋 生成選單結構...')
    const menuStructure = generateMenuStructure(PAGES_DIR)
    console.log(`找到 ${countItems(menuStructure)} 個項目`)

    // 生成所有頁面
    console.log('\n📄 生成頁面...')
    generateAllPages({
        pagesDir: PAGES_DIR,
        outputDir: OUTPUT_DIR,
        templatePath: TEMPLATE_PATH,
        menuStructure: menuStructure,
        menuItems: menuStructure.children || []
    })

    console.log('\n✅ 建置完成!')
    console.log(`📁 輸出目錄: ${OUTPUT_DIR}`)
}

/**
 * 計算選單項目數量
 */
const countItems = (menu, count = 0) => {
    if (menu.children) {
        count += menu.children.length
        for (const child of menu.children) {
            count = countItems(child, count)
        }
    }
    return count
}

// 執行建置
build().catch((err) => {
    console.error('❌ 建置錯誤:', err)
    process.exit(1)
})
