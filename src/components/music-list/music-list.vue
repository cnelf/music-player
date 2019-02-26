<template>
  <div class="music-list">
    <div class="back" @click="back" v-show="bgImage">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper" v-show="bgImage" ref="playBtn">
        <div class="play" @click="randomPlayAll">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll" :probeType="probeType" :listenScroll="listenScroll" :data="songs" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list :rank="rank" @select="selectItem" :songs="songs"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import {prefixStyle} from 'common/js/dom'
import Loading from 'base/loading/loading'
import {mapActions} from 'vuex'
import {playlistMixin} from 'common/js/mixin'

const transfrom = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')

const RESERVE_HEIGHT = 40

export default {
  mixins: [playlistMixin],
  data() {
    return {
      scrollY: 0
    }
  },
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  created() {
    this.probeType = 3
    this.listenScroll = true
  },
  mounted() {
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
  },
  methods: {
    handlePlaylist(playlist) {
      if (playlist.length > 0) {
        this.$refs.list.$el.style.bottom = `60px`
        this.$refs.list.refresh()
      } else {
        this.$refs.list.$el.style.bottom = ``
        this.$refs.list.refresh()
      }
    },
    scroll(pos) {
      this.scrollY = pos.y
    },
    back() {
      this.$router.back()
    },
    selectItem(song, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    randomPlayAll() {
      this.randomPlay({
        list: this.songs
      })
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  computed: {
    bgStyle() {
      return `background-image: url(${this.bgImage})`
    }
  },
  watch: {
    scrollY(y) {
      let zIndex = 0
      let minTranslate = -this.imageHeight + RESERVE_HEIGHT
      let percent = Math.abs(y / this.imageHeight)
      let scalePercent = 1 + percent
      let blurDegree = Math.min(20, 20 * percent)
      let translateY = Math.max(minTranslate, y)
      this.$refs.layer.style[transfrom] = `translate3d(0, ${translateY}px, 0)`

      if (y > 0) {
        this.$refs.bgImage.style[transfrom] = `scale(${scalePercent})`
        zIndex = 10
      } else {
        // 高斯模糊
        // this.$refs.bgImage.style.filter = `blur(${blurDegree}px)`
        // ios系统显示
        this.$refs.filter.style[backdrop] = `blur(${blurDegree}px)`
      }

      if (y < minTranslate) {
        zIndex = 10
        this.$refs.bgImage.style.paddingTop = 0
        this.$refs.bgImage.style.height = `${RESERVE_HEIGHT}px`
        this.$refs.playBtn.style.display = 'none'
      } else {
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = 0
        this.$refs.playBtn.style.display = ''
      }

      this.$refs.bgImage.style.zIndex = zIndex
    }
  },
  components: {
    Scroll,
    SongList,
    Loading
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
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
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        width: 100%
        z-index: 1
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
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
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
