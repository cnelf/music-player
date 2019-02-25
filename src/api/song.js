import {commonParams} from './config'
import axios from 'axios'

export function getLyric(mid) {
  // 请求中间层api
  const url = 'api/getLyric'

  // 拼接params
  const data = Object.assign({}, commonParams, {
    // -: 'MusicJsonCallback_lrc',
    pcachetime: +new Date(),
    songmid: mid,
    loginUin: 0,
    hostUin: 0,
    format: 'json',
    platform: 'yqq.json',
    needNewCode: 0
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    // 拿到中间层的res后将其包装成promise对象返回出去
    return Promise.resolve(res.data)
  })
}