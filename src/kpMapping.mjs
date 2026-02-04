import path from 'path'
import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'


let kpAl={
    '2019/年度文/2html':'讀書會/7.《我在讀書會學到什麼》彙整稿',
    '2020/年度文/2html':'讀書會/8.《春秋》「公羊學‧三世說」歷史哲學觀照下的生命足跡彙整稿',
    '2021/年度文/2html':'讀書會/9.《大變局下的2020--我的見、聞、感、思、悟》彙整稿',
    '2022/年度文/2html':'讀書會/10.《我在讀書會聽見自己生命的主題曲》彙整稿',
    '2023/年度文/2html':'讀書會/11.《「愛之旅」的實踐體驗》彙整稿',
    '2024/年度文/2html':'讀書會/12.《說「關係」--關於「我」與謝錦及生命覺醒讀書會》彙整稿',
    '2025/年度文/2html':'讀書會/13.《從「哲學層次的善惡觀」看覺醒功課中的自己和讀書會》彙整稿',
    '2026/年度文/2html':'讀書會/14.《「我」由情入愛的足跡及所到的位置》彙整稿',
}
if(true){
    let _kpAl={}
    _.each(kpAl,(v,k)=>{
        let vv=v.replaceAll('/','\\')
        let kk=k.replaceAll('/','\\')
        _kpAl[kk]=vv
    })
    kpAl=_kpAl
}

let cv=(fp)=>{
    _.each(kpAl,(v,k)=>{
        if(fp.indexOf(k)>=0){
            fp=fp.replace(k,v)
            return false //跳出
        }
    })
    return fp
}

let ndcv=(fp)=>{
    // let b=false
    // _.each(kpAl,(v,k)=>{
    //     if(fp.indexOf(k)>=0){
    //         b=true
    //         return false //跳出
    //     }
    // })
    let b=fp.indexOf('年度文\\2html')>=0
    return b
}

let ndrp=(fp)=>{
    let b1=fp.indexOf('讀書會')>=0
    let b2=fp.indexOf('彙整稿')>=0
    let b=b1&&b2
    return b
}

let r={
    kpAl,
    ndcv,
    ndrp,
    cv,
}


export default r