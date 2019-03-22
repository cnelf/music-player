import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15

// 插入搜索历史到数组
function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  // 如果搜索历史恰好第一位 不需要处理
  if (index === 0) {
    return
  }
  // 如果列表中有记录且不在第一位 则先删除
  if (index > 0) {
    arr.splice(index, 1)
  }
  // 将记录放在列表首位
  arr.unshift(val)
  // 如果列表输超过最大存储容量 则将后面的数据删除
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

export function saveSearch(query) {
  // 从localStorage中拿到search列表 没有则返回空数组
  let searches = storage.get(SEARCH_KEY, [])
  // 插入记录到列表
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)
  // 将记录保存到localStorage
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

function deleteFromArray(arr, compare) {
  let index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export function deleteSearch(oneItem) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === oneItem
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}