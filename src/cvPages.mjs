import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import prettier from 'prettier'
import cvPage from './cvPage.mjs'


let fdPages=`./pages`
if(!w.fsIsFolder(fdPages)){
    w.fsCreateFolder(fdPages)
}

let fdRela='./rela'

let cvPages=async()=>{

    let fpRela=path.resolve(fdRela,'rela.json')
    let kpRela=fs.readFileSync(fpRela,'utf8')
    kpRela=JSON.parse(kpRela)

    let vfps=w.fsTreeFolder(fdPages,null)
    // console.log('vfps',vfps)

    let t=`.html-conv.txt`
    vfps=_.filter(vfps,(v)=>{
        return w.strright(v.name,14)===t
    })
    // console.log('vfps',vfps)

    await w.pmSeries(vfps,async(v)=>{
        // console.log('v',v)

        let fpSrc=v.path
        // console.log('fpSrc',fpSrc)

        let fpTar=fpSrc.replace(t,'.html')
        console.log('fpTar',fpTar)

        // if(fpTar.indexOf('429.html')>=0 ){
        // }
        // else{
        //     return
        // }
        // console.log('fpTar',fpTar)

        let fpRef=_.get(kpRela,fpSrc,'')
        // console.log('fpRef',fpRef)

        await cvPage(fpRef,fpSrc,fpTar)
        
    })
    
}


export default cvPages
