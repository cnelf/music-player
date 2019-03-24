import * as types from './mutation-types'

const mutations = {
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  },
  [types.SET_PLAYING_STATE](state, flag) {
    state.playing = flag
  },
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST](state, list) {
    // list是引用类型的数组，有可能会在vuex之外的地方被修改，所以修改state时需要一个list的副本
    state.playlist = Object.assign([], list)
    // 方法二：state.playlist = JSON.parse(JSON.stringify(list))
    // 报错：state.playlist = list
  },
  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = Object.assign([], list)
    // state.sequenceList = list
  },
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index
  },
  [types.SET_PLAY_MODE](state, mode) {
    state.playMode = mode
  },
  [types.SET_DISC](state, disc) {
    state.disc = disc
  },
  [types.SET_TOP_LIST](state, toplist) {
    state.toplist = toplist
  },
  [types.SET_SEARCH_HISTORY](state, query) {
    state.searchHistory = query
  },
  [types.SET_PLAY_HISTORY](state, songs) {
    state.playHistory = songs
  },
  [types.SET_FAVORITE_LIST](state, songs) {
    state.favoriteList = songs
  }
}

export default mutations