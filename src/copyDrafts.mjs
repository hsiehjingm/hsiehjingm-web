import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import kpm from './kpMapping.mjs'


let fdPages=`./pages`
if(!w.fsIsFolder(fdPages)){
    w.fsCreateFolder(fdPages)
}
w.fsCleanFolder(fdPages)

let fdRela='./rela'
if(!w.fsIsFolder(fdRela)){
    w.fsCreateFolder(fdRela)
}
w.fsCleanFolder(fdRela)

let t='D:\\- 061 -        謝錦讀書會\\16. 網站內容\\v3\\'

let cvfp=(fp)=>{
    fp=fp.replace(t,'')
    fp=w.strdelleft(fp,2)
    fp=path.resolve(fdPages,fp)
    return fp
}

let copyDrafts=async(fdSrc)=>{

    let vfps=w.fsTreeFolder(fdSrc,null)
    // console.log('vfps',vfps)

    let t=`.html-conv.txt`
    vfps=_.filter(vfps,(v)=>{
        return w.strright(v.name,14)===t //過濾完剩檔案
    })
    // console.log('vfps',vfps)

    let kp={}
    _.each(vfps,(v)=>{

        let fpSrc=v.path

        let b=kpm.ndrp(v.path)
        if(b){
            return true //跳出換下一個
        }

        let fpTar=cvfp(v.path)

        console.log(fpSrc,'=>',fpTar)
        w.fsCopyFile(fpSrc,fpTar)

        kp[fpTar]=fpSrc
        
    })

    let fpRela=path.resolve(fdRela,'rela.json')
    fs.writeFileSync(fpRela,JSON.stringify(kp,null,2),'utf8')

}


export default copyDrafts
