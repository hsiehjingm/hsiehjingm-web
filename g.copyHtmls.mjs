import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import copyHtmls from './src/copyHtmls.mjs'


let fpSrc=`D:\\專案-謝錦讀書會程式處理網站內容`
await copyHtmls(fpSrc)


//node g.copyHtmls.mjs
