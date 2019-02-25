import {mapGetters} from 'vuex'

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