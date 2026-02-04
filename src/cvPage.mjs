import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import prettier from 'prettier'
import clearHtml from './clearHtml.mjs'
import getImgB64 from './getImgB64.mjs'
import downloadImg from './downloadImg.mjs'


let fpTmp=`./src/page.html.tmp`

let formatHtml=async(h,opt={})=>{

    let hSrc = ''

    let condense=_.get(opt,'condense',false)

    let optFmt={
        parser: 'html',
        // printWidth: 80, // 每行最多字元，超過就換行
        tabWidth: 4,    // 縮排空格數
        useTabs: false, // 用空格縮排
        htmlWhitespaceSensitivity: 'css', // 嚴格依 CSS 視為空白敏感, u內span不會被額外添加換行或前後空格, 避免額外顯示錯誤
        bracketSameLine: false, //false代表 > 另起一行
        singleAttributePerLine: false, // 單行屬性換行
    }
    if(condense){
        optFmt={
            ...optFmt,
            printWidth: 2000, // 盡量大，減少自動換行
            bracketSameLine: true, // inline 元素結尾盡量同行
        }
    }

    await prettier.format(h,optFmt)
        .then((res)=>{
            hSrc=res
        })
        .catch((err)=>{
            // console.log(err)
            console.log('prettier.format發生錯誤')
        })

    return hSrc
}

let cvPage=async(fpRef,fpSrc,fpTar)=>{

    let hTmp=fs.readFileSync(fpTmp,'utf8')

    let hSrc=fs.readFileSync(fpSrc,'utf8')
    
    // hSrc = await clearHtml(hSrc)

    hSrc = await formatHtml(hSrc)

    if(!w.isestr(hSrc)){
        console.log('fpTar',fpTar)
        throw new Error('無法轉出html')
    }

    if(true){
        // let s=w.sep(hSrc,'\n')
        let s=_.split(hSrc,'\n')
        let ss=[]
        let bimg=false
        await w.pmSeries(s,async(v)=>{
            let vv=_.trim(v)

            if(vv==='<img'){
                bimg=true
            }
            else if(bimg && vv==='/>'){
                bimg=false
            }
            else if(bimg){
                // console.log('v',v)
                // console.log('vv',vv)

                if(w.strleft(vv,4)==='id="'){
                    v=''
                }
                else if(w.strleft(vv,5)==='alt="'){
                    v=''
                }
                else if(w.strleft(vv,7)==='width="'){
                    v=''
                }
                else if(w.strleft(vv,8)==='height="'){
                    v=''
                }
                else if(w.strleft(vv,8)==='border="'){
                    v=''
                }
                else if(w.strleft(vv,5)==='src="'){

                    let url=w.strdelleft(vv,5)
                    url=w.strdelright(url,1)
                    // console.log('url',url)

                    if(w.strleft(url,6)==='https:' || w.strleft(url,5)==='http:'){
                        //網路檔案

                        let b64=await downloadImg(url)
                        // console.log('b64',b64)

                        v=`src="${b64}"`

                    }
                    else{
                        //本機檔案

                        let fdRef=w.getPathParent(fpRef)

                        let fpImg=path.resolve(fdRef,url)
                        // console.log('fpImg',fpImg)

                        if(!w.fsIsFile(fpImg)){
                            throw new Error(`檔案不存在[${fpImg}]`)
                        }

                        let b64=getImgB64(fpImg)
                        // console.log('b64',b64)

                        v=`src="${b64}"`

                    }
                }

            }

            if(w.isestr(v)){
                ss.push(v)
            }

        })
        hSrc=_.join(ss,'\n')
    }

    if(true){
        let keys=[
            'background',
            'letter-spacing',
            'layout-grid-mode',
            // 'text-decoration',
        ]
        _.each(keys,(key)=>{
            let from=` ${key}:`
            let to=`_${key}:`
            hSrc=hSrc.replaceAll(from,to)
        })
        let rps=[
            {
                from:`color: blue; text-decoration: underline`,
                to:`_color: blue; _text-decoration: underline`,
            },
        ]
        _.each(rps,(rp)=>{
            let from=rp.from
            let to=rp.to
            hSrc=hSrc.replaceAll(from,to)
        })
    }

    // hSrc = await formatHtml(hSrc,{condense:true})

    let h=hTmp.replace('{srcCont}',hSrc)

    fs.writeFileSync(fpTar,h,'utf8')

}


export default cvPage
