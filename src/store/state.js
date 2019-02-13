import {mode} from './config'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  currentIndex: -1,
  playMode: mode.sequence
}

export default state