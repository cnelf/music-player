export function addClass(el, className) {
  if (hasClass(el, className)) {
    return
  }
  let classname = el.className.split(' ')
  classname.push(className)
  el.className = classname.join(' ')
}

export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '($|\\s)')
  return reg.test(el.className)
}