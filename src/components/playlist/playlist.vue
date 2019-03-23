<template>
  <transition name="list-fade">
    <div @click="closePlaylist" class="playlist" v-show="showFlag">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i @click="changeMode" class="icon" :class="iconMode"></i>
            <span class="text">{{modeText}}</span>
            <span @click="showConfirm" class="clear">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <scroll ref="listContent" class="list-content" :data="sequenceList">
          <transition-group name="list" ref="list" tag="ul">
            <li ref="listItem" @click="selectItem(item, index)" class="item" v-for="(item, index) in sequenceList" :key="item.id">
              <i class="current" :class="currentIconCls(item)"></i>
              <span class="text">{{item.name}}</span>
              <span class="like">
                <i></i>
              </span>
              <span @click.stop="deleteOneSong(item)" class="delete">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click.stop="showAddSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div @click="closePlaylist" class="list-close">
          <span>关闭</span>
        </div>
      </div>
      <confirm @confirm="clearSong" ref="confirm" text="是否清空播放列表" confirmBtnText="清空"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import {mapGetters, mapMutations, mapActions} from 'vuex'
import {mode} from 'store/config'
import Scroll from 'base/scroll/scroll'
import Confirm from 'base/confirm/confirm'
import {playerMixin} from 'common/js/mixin'
import AddSong from 'components/add-song/add-song'

export default {
  mixins: [playerMixin],
  data() {
    return {
      showFlag: false
    }
  },
  computed: {
    modeText() {
      return this.playMode === mode.sequence ? '顺序播放' : this.playMode === mode.loop ? '单曲循环' : '随机播放'
    },
    ...mapGetters([
      'playMode',
      'sequenceList',
      'playlist',
      'currentSong'
    ])
  },
  methods: {
    show() {
      this.showFlag = true
      setTimeout(() => {
        this.$refs.listContent.refresh()
        this.scrollToCurrent(this.currentSong)
      }, 20)
    },
    hide() {
      this.showFlag = false
    },
    closePlaylist() {
      this.hide()
    },
    selectItem(item, index) {
      if (this.playMode === mode.random) {
        index = this.playlist.findIndex((song) => {
          return song.id === item.id
        })
      }
      this.setCurrentIndex(index)
      this.setPlayingState(true)
    },
    currentIconCls(item) {
      return this.currentSong.id === item.id ? 'icon-play' : ''
    },
    // 切换歌曲后列表滚动到该歌曲
    scrollToCurrent(current) {
      const index = this.sequenceList.findIndex((song) => {
        return song.id === current.id
      })
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
    },
    // 删除列表中的歌曲
    deleteOneSong(item) {
      this.deleteSong(item)
      // 解決清空列表 再选择歌曲时自动弹出playlist的bug
      if (!this.playlist.length) {
        this.hide()
      }
    },
    showConfirm() {
      this.$refs.confirm.show()
    },
    clearSong() {
      this.clearSongList()
      this.hide()
    },
    // 打开添加歌曲页
    showAddSong() {
      this.$refs.addSong.show()
    },
    ...mapMutations({
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'deleteSong',
      'clearSongList'
    ])
  },
  watch: {
    // 监听currentSong发生变化时 滚动列表
    currentSong(newSong, oldSong) {
      if (!this.showFlag && newSong.id === oldSong.id) {
        return
      }
      // 延时20ms 防止currentSong改变时dom还未渲染 scrollToCurrent方法获取不到dom
      setTimeout(() => {
        this.scrollToCurrent(newSong)
      }, 20)
    }
  },
  components: {
    Scroll,
    Confirm,
    AddSong
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>
