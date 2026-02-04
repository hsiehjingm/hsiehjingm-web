import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'


let ext2mime = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.bmp':  'image/bmp',
  '.svg':  'image/svg+xml',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
}

function getImgB64(filePath) {

  let ext = path.extname(filePath).toLowerCase()

  if(!w.haskey(ext2mime,ext)){
    console.log('ext2mime',ext2mime)
    throw new Error(`can not support ext[${ext}]`)
  }

  let mime = ext2mime[ext] 

  // SVG 建議直接讀字串再做 URI encode（也可用 base64，這裡用 base64 比較通用）
  let buf = fs.readFileSync(filePath)
  let b64 = buf.toString('base64')
  return `data:${mime};base64,${b64}`
}

export default getImgB64