import jsonp from 'common/js/jsonp'
import {commonParams, options} from 'api/config'
import axios from 'axios'

export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
    // _: 1551284561184
    uin: 0,
    platform: 'h5',
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

export function getSearchSuggest(query, page, zhida) {
  // const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  const url = '/api/getSuggest'

  const data = Object.assign({}, commonParams, {
    // _: 1551414659625
    uin: 0,
    platform: 'h5',
    needNewCode: 1,
    w: query,
    zhidaqu: 1,
    catZhida: zhida ? 1 : 0,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage: 20,
    n: 20,
    p: page
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}