<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches @switch="switchItem" :currentIndex="currentIndex" :switches="switches"></switches>
      </div>
      <div class="play-btn" @click.stop="randomPlayAll">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <scroll ref="favoriteList" v-if="currentIndex === 0" class="list-scroll" :data="favoriteList">
          <div class="list-inner">
            <song-list @select="selectPlay" :songs="favoriteList"></song-list>
          </div>
        </scroll>
        <scroll ref="playHistory" v-if="currentIndex === 1" class="list-scroll" :data="playHistory">
          <div class="list-inner">
            <song-list @select="selectPlay" :songs="playHistory"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="showNoResult">
        <no-result :title="noResultTitle"></no-result>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import Switches from 'base/switches/switches'
import Scroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import {mapGetters, mapActions} from 'vuex'
import Song from 'common/js/song'
import {playlistMixin} from 'common/js/mixin'
import NoResult from 'base/no-result/no-result'

export default {
  mixins: [playlistMixin],
  data() {
    return {
      currentIndex: 0,
      switches: [
        {name: '我喜欢的'},
        {name: '最近听的'}
      ]
    }
  },
  computed: {
    showNoResult() {
      if (this.currentIndex === 0) {
        return !this.favoriteList.length
      } else {
        return !this.playHistory.length
      }
    },
    noResultTitle() {
      return this.currentIndex === 0 ? '你还没有收藏的歌曲' : '你还没有听过歌曲'
    },
    ...mapGetters([
      'favoriteList',
      'playHistory'
    ])
  },
  methods: {
    back() {
      this.$router.back()
    },
    switchItem(index) {
      this.currentIndex = index
    },
    selectPlay(item, index) {
      this.insertSong(new Song(item))
    },
    randomPlayAll() {
      if (this.currentIndex === 0) {
        if (this.favoriteList.length === 0) {
          return
        }
        let list = this.favoriteList.map((item) => {
          return new Song(item)
        })
        this.randomPlay({list})
      } else {
        if (this.playHistory.length === 0) {
          return
        }
        let list = this.playHistory.map((item) => {
          return new Song(item)
        })
        this.randomPlay({list})
      }
    },
    handlePlaylist(playlist) {
      let bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.listWrapper.style.bottom = bottom
      if (this.currentIndex === 0) {
        this.$refs.favoriteList.refresh()
      } else {
        this.$refs.playHistory.refresh()
      }
    },
    ...mapActions([
      'insertSong',
      'randomPlay'
    ])
  },
  components: {
    Switches,
    Scroll,
    SongList,
    NoResult
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 100
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position: absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
