import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import copyDrafts from './src/copyDrafts.mjs'


let fpSrc=`D:\\- 061 -        謝錦讀書會\\16. 網站內容\\v3`
await copyDrafts(fpSrc)


//node g.copyDrafts.mjs
