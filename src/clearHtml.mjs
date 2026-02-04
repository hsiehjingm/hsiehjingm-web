import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import * as cheerio from 'cheerio'


let clearHtml=async(h)=>{

    // 假設 HTML 內容
    // let h = `
    // <u>
    //   <span style="font-size: 14pt; font-family: 標楷體; color: blue"> 堂 </span>
    // </u>
    // `

    // 載入 HTML
    let $ = cheerio.load(h, { decodeEntities: false })

    // 尋找所有 span
    $('u > span').each((i, el) => {
        let text = $(el).text()
        let trimmed = text.trim()

        // 如果前後有空白，才更新
        if (text !== trimmed) {
            $(el).text(trimmed)
        }
    })

    let hh=$.html()
    // console.log('hh',hh)

    return hh
}


export default clearHtml