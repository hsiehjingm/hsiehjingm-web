import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import kpm from './kpMapping.mjs'


let fdPages=`./pages`
if(!w.fsIsFolder(fdPages)){
    w.fsCreateFolder(fdPages)
}
// w.fsCleanFolder(fdPages)

let t='D:\\專案-謝錦讀書會程式處理網站內容\\'

let cvfp=(fp)=>{
    fp=fp.replace(t,'')
    fp=kpm.cv(fp)
    fp=path.resolve(fdPages,fp)
    return fp
}

let copyHtmls=async(fdSrc)=>{

    let vfps=w.fsTreeFolder(fdSrc,null)
    // console.log('vfps',vfps)

    vfps=_.filter(vfps,(v)=>{
        let b1=kpm.ndcv(v.path)
        let b2=w.getFileNameExt(v.name)==='html'
        let b=b1 && b2
        return b
    })
    // console.log('vfps',vfps)

    _.each(vfps,(v)=>{

        let fpSrc=v.path

        let fpTar=v.path
        fpTar=fpTar.replaceAll('/','\\')
        fpTar=cvfp(fpTar)

        console.log(fpSrc,'=>',fpTar)
        w.fsCopyFile(fpSrc,fpTar)

    })

}


export default copyHtmls
