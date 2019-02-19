<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div
        class="progress-btn-wrapper"
        ref="progressBtn"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import {prefixStyle} from 'common/js/dom'

const transform = prefixStyle('transform')
const progressBtnWidth = 12

export default {
  data() {
    return {
      touch: {}
    }
  },
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    percent(newPercent) {
      if (newPercent > 0 && !this.touch.initialed) {
        let barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        let offsetWidth = barWidth * newPercent
        this._offsetWidth(offsetWidth)
      }
    }
  },
  methods: {
    progressTouchStart(e) {
      this.touch.initialed = true
      this.touch.startX = e.touches[0].pageX
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove(e) {
      if (!this.touch.initialed) {
        return
      }
      let moveWidth = e.touches[0].pageX - this.touch.startX
      let offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + moveWidth))
      this._offsetWidth(offsetWidth)
    },
    progressTouchEnd() {
      this.touch.initialed = false
      this._triggerProgress()
    },
    progressClick(e) {
      this._offsetWidth(e.offsetX - 5)
      this._triggerProgress()
    },
    _triggerProgress() {
      let barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      let progressWidth = this.$refs.progress.clientWidth
      let percent = progressWidth / barWidth
      this.$emit('changePercent', percent)
    },
    _offsetWidth(offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    touch-action: none
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
