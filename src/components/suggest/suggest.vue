<template>
  <scroll
    ref="suggest"
    class="suggest"
    :data="result"
    :pullUpRefresh="pullUpRefresh"
    :beforeScroll="beforeScroll"
    @scrollToBottom="searchMore"
    @scrolling="scrolling"
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="(item, index) in result" :key="index">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getSongText(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" :title="title"></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="很抱歉，没有找到匹配的歌曲"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import {getSearchSuggest} from 'api/search'
import {ERR_OK} from 'api/config'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import Singer from 'common/js/singer'
import {mapMutations, mapActions} from 'vuex'
import {getSongVkey} from 'api/singer'
import {createSong} from 'common/js/song'
import NoResult from 'base/no-result/no-result'

export default {
  data() {
    return {
      page: 1,
      result: [],
      pullUpRefresh: true,
      beforeScroll: true,
      hasMore: true,
      title: ''
    }
  },
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  // created() {
  //   this._getSuggest()
  // },
  methods: {
    // 选择搜索结果
    selectItem(item) {
      if (item.type === 'singer') {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      this.$emit('selected')
    },
    getIconCls(item) {
      if (item.type === 'singer') {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    getSongText(item) {
      if (item.type === 'singer') {
        return item.singername
      } else {
        return `${item.name} - ${item.singer}`
      }
    },
    search() {
      // 第一次搜索将默认值重置
      this.page = 1
      this.$refs.suggest.scrollTo(0, 0)
      this.hasMore = true
      getSearchSuggest(this.query, this.page, this.showSinger).then((res) => {
        if (res.code === ERR_OK) {
          // this.result = this._genSuggest(res.data)
          this._genSuggest(res.data).then((res) => {
            this.result = res
          })
          this._checkMore(res.data.song)
        }
      })
    },
    // 下拉加载
    searchMore() {
      if (!this.hasMore) {
        return
      }
      this.page++
      getSearchSuggest(this.query, this.page, this.showSinger).then((res) => {
        if (res.code === ERR_OK) {
          // this.result = this.result.concat(this._genSuggest(res.data))
          this._genSuggest(res.data).then((res) => {
            this.result = this.result.concat(res.slice(1))
          })
          this._checkMore(res.data.song)
        }
      })
    },
    // 列表开始滚动
    scrolling() {
      this.$emit('scrolling')
    },
    refresh() {
      this.$refs.suggest.refresh()
    },
    // 检查是否还有数据
    _checkMore(song) {
      if (!song.list.length || (song.curnum + (song.curpage - 1) * 20) >= song.totalnum) {
        this.hasMore = false
      }
    },
    async _genSuggest(data) {
      let ret = []
      if (data.zhida && data.zhida.singerid) {
        ret.push({...data.zhida, ...{type: 'singer'}})
      }
      if (data.song) {
        await this._normalizeSong(data.song.list).then((res) => {
          ret = ret.concat(res)
        })
        // ret = ret.concat(this._normalizeSong(data.song.list))
      }
      // async包装的函数 返回一个promise
      return ret
    },
    async _normalizeSong(list) {
      let ret = []
      // let flag = 0
      // let len = list.length
      // for (let i = 0; i < len; i++) {
      //   getSongVkey(list[i].songmid).then((res) => {
      //     flag++
      //     let vkey = res.data.items[0].vkey
      //     let song = createSong(list[i], vkey)
      //     ret.push(song)
      //     if (flag === len) {
      //       return ret
      //     }
      //   })
      // }

      // list.forEach((item) => {
      //   getSongVkey(item.songmid).then((res) => {
      //     let vkey = res.data.items[0].vkey
      //     let song = createSong(item, vkey)
      //     ret.push(song)
      //   })
      // })

      // getSongList(0, list.length)
      // function getSongList(j, length) {
      //   getSongVkey(list[j].songmid).then((res) => {
      //     let vkey = res.data.items[0].vkey
      //     let song = createSong(list[j], vkey)
      //     ret.push(song)
      //     if (++j < length) {
      //       getSongList(j, length)
      //     }
      //   })
      // }

      // list.forEach((item) => {
      //   if (item.albumid && item.songmid) {
      //     getSongVkey(item.songmid).then((res) => {
      //       debugger
      //       let vkey = res.data.items[0].vkey
      //       let song = createSong(item, vkey)
      //       ret.push(song)
      //     })
      //   }
      // })
      for (let item of list) {
        if (item.albumid && item.songmid) {
          await getSongVkey(item.songmid).then((res) => {
            let vkey = res.data.items[0].vkey
            let song = createSong(item, vkey)
            ret.push(song)
          })
        }
      }
      return ret
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    query() {
      this.search()
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
        .icon
          flex: 0 0 30px
          width: 30px
          [class^="icon-"]
            font-size: 14px
            color: $color-text-d
        .name
          flex: 1
          font-size: $font-size-medium
          color: $color-text-d
          overflow: hidden
          .text
            no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
