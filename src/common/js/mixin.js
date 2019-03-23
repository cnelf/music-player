import {mapGetters, mapMutations, mapActions} from 'vuex'
import {mode} from 'store/config'
import {shuffle} from 'common/js/util'

export const playlistMixin = {
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  },
  watch: {
    playlist(newValue) {
      this.handlePlaylist(newValue)
    }
  }
}

export const playerMixin = {
  computed: {
    iconMode() {
      switch (this.playMode) {
        case mode.sequence:
          return 'icon-sequence'
        case mode.loop:
          return 'icon-loop'
        case mode.random:
          return 'icon-random'
      }
    },
    ...mapGetters([
      'playMode',
      'sequenceList'
    ])
  },
  methods: {
    changeMode() {
      let playMode = (this.playMode + 1) % 3
      this.setPlayMode(playMode)
      let list = null
      if (playMode === mode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    })
  }
}

export const searchMixin = {
  data() {
    return {
      query: ''
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    newQuery(query) {
      this.query = query
    },
    blurInput() {
      this.$refs.searchBox.blur()
    },
    // 点击搜索结果后保存搜索记录到搜索历史
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    // 点击搜索历史 在输入框内显示
    selectSearch(item) {
      this.$refs.searchBox.setQuery(item)
    },
    // 删除搜索列表的一条记录
    deleteSearch(item) {
      this.deleteSearchHistory(item)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}