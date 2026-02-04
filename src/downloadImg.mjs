import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import axios from 'axios'
import { extension as mimeExt } from 'mime-types'
import getImgB64 from './getImgB64.mjs'


let fdImg='./img'
if(!w.fsIsFolder(fdImg)){
    w.fsCreateFolder(fdImg)
}
// w.fsCleanFolder(fdImg)

async function core(url,key) {
  console.log(`下載檔案[${url}]...`)

  try {

    // 發送請求（拿 response header）
    let res = await axios.get(url, { responseType: 'arraybuffer' })

    // 從網址解析副檔名
    let ext = path.extname(new URL(url).pathname).toLowerCase()

    // 如果沒有副檔名，或副檔名看起來不正常，嘗試用 Content-Type 偵測
    if (!ext || ext.length < 2) {
      let contentType = res.headers['content-type']
      let detectedExt = mimeExt(contentType) // 例如 'png', 'jpeg'
      if (detectedExt) {
        ext = `.${detectedExt}`
      } else {
        ext = '.bin' // 無法判斷時給預設
      }
    }

    let fileName = `${key}${ext}`

    let savePath = path.join(fdImg, fileName)

    fs.writeFileSync(savePath, res.data)

    return savePath

  } 
  catch (err) {
    console.log(err)
  }

}

async function downloadImg(url) {

  let key=w.str2b64(url)

  let fpB64=path.resolve(fdImg,`${key}.b64`)

  if(w.fsIsFile(fpB64)){
    console.log(`使用快取檔案[${fpB64}]`)

    let b64=fs.readFileSync(fpB64,'utf8')

    return b64
  }

  try {

    let fpImg=await core(url,key)

    let b64=getImgB64(fpImg)
    // console.log('b64',b64)

    fs.writeFileSync(fpB64,b64,'utf8')

  } 
  catch (err) {
    console.log(err)
  }

}

export default downloadImg