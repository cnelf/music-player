<template>
  <scroll
    :data="data"
    class="listview"
    ref="listview"
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="scroll"
  >
    <ul>
      <li class="list-group" v-for="(group, index) in data" :key="index" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectSinger(item)" class="list-group-item" v-for="(item, index) in group.items" :key="index">
            <img class="avatar" v-lazy="item.avatar" alt="item.name">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <li
          class="item"
          v-for="(item, index) in shortcutList"
          :key="index"
          :data-index="index"
          :class="{'current': currentIndex === index}"
        >{{item}}</li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h2 class="fixed-title">{{fixedTitle}}</h2>
    </div>
    <div class="loading-container" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import {getData} from 'common/js/dom'
import Loading from 'base/loading/loading'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
  data() {
    return {
      listenScroll: true,
      probeType: 3,
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  created() {
    this.touch = {}
    this.heightGroup = []
  },
  computed: {
    shortcutList() {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle() {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    refresh() {
      this.$refs.listview.refresh()
    },
    onShortcutTouchStart(e) {
      // e.target返回点击的目标dom节点
      // console.log(e.target)
      let anchorIndex = getData(e.target, 'index')
      let startTouch = e.touches[0]
      this.touch.y1 = startTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove(e) {
      let moveTouch = e.touches[0]
      this.touch.y2 = moveTouch.pageY
      // '| 0' 向下取整, 与Math.floor作用相同
      let deltaIndex = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + deltaIndex
      this._scrollTo(anchorIndex)
    },
    scroll(pos) {
      this.scrollY = pos.y
      // console.log(this.scrollY)
    },
    selectSinger(item) {
      this.$emit('select', item)
    },
    _scrollTo(index) {
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },
    _calculateHeight() {
      let height = 0
      this.heightGroup.push(height)
      const list = this.$refs.listGroup
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.heightGroup.push(height)
      }
      // console.log(this.heightGroup)
    }
  },
  watch: {
    data() {
      // 数据变化到dom变化需要一定的时间
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    scrollY(y) {
      const heightGroup = this.heightGroup
      for (let i = 0; i < heightGroup.length; i++) {
        let height1 = heightGroup[i]
        let height2 = heightGroup[i + 1]
        if (height2 && (-y >= height1 && -y < height2)) {
          this.currentIndex = i
          this.diff = height2 + y
          return
        }
      }
    },
    diff(val) {
      let fixedTop = (val > 0 && val < TITLE_HEIGHT) ? val - TITLE_HEIGHT + 1 : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3D(0, ${fixedTop}px, 0)`
    }
  },
  // updated () {
  //   console.log(this.shortcutList)
  // },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: -1px
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
