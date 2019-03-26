var express = require('express')
var config = require('./config/index')
var axios = require('axios')

var app = express()
var apiRoutes = express.Router()

apiRoutes.get('/getDicList', function (req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'

  axios.get(url, {
    headers: {
      // host: 'c.y.qq.com',
      // referer: 'https://c.y.qq.com/'
      // origin: 'https://y.qq.com',
      referer: 'https://y.qq.com/portal/playlist.html'
    },
    params: req.query
  }).then((response) => {
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})

apiRoutes.get('/getLyric', function (req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
  axios.get(url, {
    headers: {
      // host: 'c.y.qq.com',
      // referer: 'https://c.y.qq.com/'
      // origin: 'https://y.qq.com',
      origin: 'https://y.qq.com',
      referer: 'https://y.qq.com/portal/player.html'
    },
    params: req.query
  }).then((response) => {
    // response是拿到后端的响应，res是处理自己的响应
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})

// 获取歌单详情的歌曲列表
apiRoutes.get('/getSongList', function (req, res) {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  axios.get(url, {
    headers: {
      Origin: 'https://y.qq.com',
      Referer: `https://y.qq.com/n/yqq/playsquare/${req.query.disstid}.html`
    },
    params: req.query
  }).then((response) => {
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})

// 获取搜索推荐数据(不允许跨域 伪造referer)
apiRoutes.get('/getSuggest', function (req, res) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  axios.get(url, {
    headers: {
      Origin: 'https://m.y.qq.com',
      Referer: 'https://m.y.qq.com/'
    },
    params: req.query
  }).then((response) => {
    var ret = response.data
    // response是一个带有"callback()"的字符串
    if (typeof ret === 'string') {
      // 正则匹配失败 原因：字符串中含有()
      // var reg = /^\w+\(({[^()]+})\)$/
      // 截取callback()内的字符串
      var reg = /^\w+\(({.+})\)$/
      var matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  })
})

app.use('/api', apiRoutes)

// 指定静态资源目录
app.use(express.static('./dist'))

var port = process.env.PORT || config.build.port

// 启动服务 监听端口
// module.exports = app.listen(port, function(err) {
//   if (err) {
//     console.log(err)
//     return
//   }
//   console.log('listening at http://localhost:' + port + '\n')
// })

app.listen(port)

console.log('server started ' + port)