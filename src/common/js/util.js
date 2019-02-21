function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle(arr) {
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let r = getRandomNum(0, i)
    let t = _arr[i]
    _arr[i] = _arr[r]
    _arr[r] = t
  }
  return _arr
}