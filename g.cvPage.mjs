import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import cvPage from './src/cvPage.mjs'


let fpSrc=`./pages/class1/1.《謝錦》紀錄片10分鐘精華預告.html-conv.txt`
let fpTar=`./ztest.html`
await cvPage(fpSrc,fpTar)


//node g.cvPage.mjs
