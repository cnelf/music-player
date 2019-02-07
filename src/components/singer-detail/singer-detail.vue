<template>
  <transition name="slide">
    <div class="singer-detail"></div>
  </transition>
</template>

<script type="text/ecmascript-6">
import {mapGetters} from 'vuex'
import {getSingerDetail, getSongVkey} from 'api/singer'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'

export default {
  data() {
    return {
      songs: []
    }
  },
  created() {
    this._getDetail()
  },
  computed: {
    ...mapGetters([
      'singer'
    ])
  },
  methods: {
    _getDetail() {
      if (!this.singer.id) {
        this.$router.push('/singer')
        return
      }
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSingerDetail(res.data.list)
          console.log(this.songs)
        }
      })
    },
    _normalizeSingerDetail(list) {
      let ret = []
      list.forEach((item) => {
        let {musicData} = item
        getSongVkey(musicData.songmid).then((res) => {
          const vkey = res.data.items[0].vkey
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData, vkey))
          }
        })
      })
      return ret
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import '~common/stylus/variable'

  .singer-detail
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    z-index: 100
    background: $color-background
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
