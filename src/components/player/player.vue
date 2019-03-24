<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" alt="">
        </div>
        <div class="top">
          <div class="back" @click="close">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdRotate">
                <img class="image" :src="currentSong.image" alt="">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">
                {{playingLyric}}
              </div>
            </div>
          </div>
          <Scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  class="text"
                  :class="{'current': currentLineNum === index}"
                  ref="lyricLine"
                  v-for="(line, index) in currentLyric.lines"
                  :key="index"
                >
                  {{line.txt}}
                </p>
              </div>
            </div>
          </Scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <div class="dot" :class="{'active': currentShow==='cd'}"></div>
            <div class="dot" :class="{'active': currentShow==='lyric'}"></div>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{formatTime(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="progressPercent" @changePercent="changePercent"></progress-bar>
            </div>
            <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click.stop.prevent="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlay" :class="iconPlay"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click.stop.prevent="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" :class="favoriteIconCls(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdRotate" width="40" height="40" :src="currentSong.image" alt="">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :percent="progressPercent">
            <i @click.stop="togglePlay" class="icon-mini" :class="miniPlay"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <!-- @canplay改成@paly 确保歌曲可以播放时再ready -->
    <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import {mapGetters, mapMutations, mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {mode} from 'store/config'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import Playlist from 'components/playlist/playlist'
import {playerMixin} from 'common/js/mixin'

const transform = prefixStyle('transform')
const transition = prefixStyle('transition')

export default {
  mixins: [playerMixin],
  data() {
    return {
      songReady: false,
      currentTime: 0,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: ''
    }
  },
  created() {
    // 触摸相关数据
    this.touch = {}
  },
  computed: {
    iconPlay() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniPlay() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdRotate() {
      return this.playing ? 'play' : 'play pause'
    },
    disableCls() {
      return this.songReady ? '' : 'disable'
    },
    progressPercent() {
      return this.currentTime / this.currentSong.duration
    },
    ...mapGetters([
      'playlist',
      'fullScreen',
      'currentSong',
      'playing',
      'currentIndex',
      'playMode',
      'sequenceList'
    ])
  },
  methods: {
    close() {
      this.setFullScreen(false)
    },
    open() {
      this.setFullScreen(true)
    },
    enter(el, done) {
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter() {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    togglePlay() {
      if (!this.songReady) {
        return
      }
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
      this.setPlayingState(!this.playing)
    },
    prev() {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
        return
      }
      let index = this.currentIndex - 1
      if (index === -1) {
        index = this.playlist.length - 1
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlay()
      }
      this.songReady = false
    },
    next() {
      if (!this.songReady) {
        return
      }
      // 边界处理，如果只有一首歌切下一首时直接循环
      if (this.playlist.length === 1) {
        this.loop()
        return
      }
      let index = this.currentIndex + 1
      if (index === this.playlist.length) {
        index = 0
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlay()
      }
      this.songReady = false
    },
    loop() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      // 循环播放重置歌词
      this.currentLyric.seek(0)
    },
    end() {
      if (this.playMode === mode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    ready() {
      this.songReady = true
      // audio的canplay事件执行 意味着歌曲开始播放 将该歌曲插入到播放历史列表
      this.savePlayHistory(this.currentSong)
    },
    error() {
      this.songReady = true
    },
    updateTime(e) {
      this.currentTime = e.target.currentTime
    },
    formatTime(interval) {
      let time = interval | 0
      let minute = time / 60 | 0
      let second = this._pad(time % 60)
      return `${minute}:${second}`
    },
    changePercent(percent) {
      let changedTime = this.currentSong.duration * percent
      this.$refs.audio.currentTime = changedTime
      if (!this.playing) {
        this.togglePlay()
      }
      // 进度改变时改变歌词进度
      if (this.currentLyric) {
        this.currentLyric.seek(changedTime * 1000)
      }
    },
    getLyric() {
      this.currentSong.getLyric().then((lyric) => {
        // 防止切歌过快导致异步获取到的是上一首歌的歌词
        if (this.currentSong.lyric !== lyric) {
          return
        }
        // Lyric是lyric-parser的构造类
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        // console.log(this.currentLyric)
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    handleLyric({lineNum, txt}) {
      this.currentLineNum = lineNum
      // 歌词行号大于5时开始滚动
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    middleTouchStart(e) {
      this.touch.initialed = true
      this.touch.startX = e.touches[0].pageX
      this.touch.startY = e.touches[0].pageY
    },
    middleTouchMove(e) {
      if (!this.touch.initialed) {
        return
      }
      let deltaX = e.touches[0].pageX - this.touch.startX
      let deltaY = e.touches[0].pageY - this.touch.startY
      // 纵轴偏移大于横轴偏移时不发生移动
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      // 两种状态，显示为cd时，歌词偏移量是0，否则就是负屏宽
      let left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      // 左滑时偏移随着deltaX不断减小，但不能小于负的屏幕宽度；右滑时逐渐增大但不能大于0
      let moveWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      this.touch.percent = Math.abs(moveWidth / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${moveWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transition] = ``
      // 左滑改变cd透明度
      this.$refs.middleL.style['opacity'] = 1 - this.touch.percent
      this.$refs.middleL.style[transition] = ``
    },
    middleTouchEnd() {
      this.touch.initialed = false
      let moveWidth
      let opacity
      // 从右向左滑
      if (this.currentShow === 'cd') {
        // 滑动距离大于百分之十时自动全部划过去
        if (this.touch.percent > 0.1) {
          moveWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          moveWidth = 0
          opacity = 1
        }
      // 从左向右滑
      } else {
        if (this.touch.percent < 0.9) {
          moveWidth = 0
          opacity = 1
          this.currentShow = 'cd'
        } else {
          moveWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 0.3
      this.$refs.lyricList.$el.style[transform] = `translate3d(${moveWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transition] = `all ${time}s`
      this.$refs.middleL.style['opacity'] = opacity
      this.$refs.middleL.style[transition] = `all ${time}s`
    },
    // playlist相关操作
    showPlaylist() {
      this.$refs.playlist.show()
    },
    // 分钟位补0
    _pad(second, n = 2) {
      let len = second.toString().length
      if (len < n) {
        second = '0' + second
      }
      return second
    },
    _getPosAndScale() {
      const targetWidth = 40
      const targetPaddingLeft = 20
      const cdWidth = window.innerWidth * 0.8
      const cdPaddingLeft = (window.innerWidth - cdWidth) / 2
      const targetHeight = 30
      const cdHeight = cdWidth
      const cdPaddingTop = 80
      let x = -(cdWidth / 2 + cdPaddingLeft - (targetWidth / 2 + targetPaddingLeft))
      let y = window.innerHeight - targetHeight - cdHeight / 2 - cdPaddingTop
      let scale = targetWidth / cdWidth
      return {
        x,
        y,
        scale
      }
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'savePlayHistory'
    ])
  },
  watch: {
    currentSong(newSong, oldSong) {
      // 解决清空列表报错
      if (!newSong.id) {
        return
      }
      if (oldSong.id === newSong.id) {
        return
      }
      // 切歌时停止上一首歌词的计时器
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
      clearTimeout(this.timer)
      // nextTick手机浏览器获取不到歌曲，改用延时1s
      this.timer = setTimeout(() => {
        this.$refs.audio.play()
        this.getLyric()
      }, 1000)
    },
    playing(state) {
      this.$nextTick(() => {
        state ? this.$refs.audio.play() : this.$refs.audio.pause()
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position: absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0 auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            // 防止出现preventDefault错误
            touch-action: none
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
    .normal-enter-active, .normal-leave-active
      transition: all 0.4s
      .top, .bottom
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
    .normal-enter, .normal-leave-to
      opacity: 0
      .top
        transform: translate3d(0, -100px, 0)
      .bottom
        transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0
    .mini-enter-active, .mini-leave-active
      transition: all 0.4s
    .mini-enter, .mini-leave-to
      opacity: 0
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
