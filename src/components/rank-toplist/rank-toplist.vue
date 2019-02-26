<template>
  <transition name="slide">
    <music-list :rank="rank" :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getMusicList} from 'api/rank'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
import {getSongVkey} from 'api/singer'

export default {
  data() {
    return {
      songs: [],
      rank: true
    }
  },
  created() {
    this._getMusicList()
  },
  computed: {
    title() {
      return this.toplist.topTitle
    },
    bgImage() {
      if (this.songs.length > 0) {
        return this.songs[0].image
      } else {
        return ''
      }
    },
    ...mapGetters([
      'toplist'
    ])
  },
  methods: {
    _getMusicList() {
      if (!this.toplist.id) {
        this.$router.push('/rank')
        return
      }
      getMusicList(this.toplist.id).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeMusicList(res.songlist)
        }
      })
    },
    _normalizeMusicList(list) {
      let ret = []
      list.forEach((item) => {
        let musicData = item.data
        getSongVkey(musicData.songmid).then((res) => {
          let vkey = res.data.items[0].vkey
          ret.push(createSong(musicData, vkey))
        })
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
