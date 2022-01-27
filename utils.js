function toast(text, duration = 2000) {
  const timeout = window._toastTimeout
  const PARENT_ID = 'toast-container'
  let parent = document.querySelector(`#${PARENT_ID}`)
  if (!parent) {
    parent = document.createElement('div')
    parent.id = PARENT_ID
    parent.style = 'display:inline-block; position:fixed; left:50%; transform:translateX(-50%); z-index:9999;'
    document.body.insertBefore(parent, document.body.children[0])
  } else {
    if (timeout) clearTimeout(timeout)
  }
  const content = document.createElement('div')
  content.style = 'background: rgba(0,0,0,0.5); padding:10px; border-radius:5px; color: #FFFFFF; white-space: nowarp; margin:2px;'
  content.innerText = text
  console.error(text)
  parent.appendChild(content)
  window._toastTimeout = setTimeout(() => {
    const target = document.querySelector(`#${PARENT_ID}`)
    target.parentNode.removeChild(target)
  }, duration)
}

const delay = (time) =>
  new Promise((reslove, reject) =>
    setTimeout(() => {
      reslove()
    }, time)
  )

function map(array, func) {
  let result = []
  for (let index = 0; index < array.length; index++) {
    const data = func(array[index], index)
    result.push(data)
  }
  return result
}

function find(array, func) {
  for (let index = 0; index < array.length; index++) {
    const data = func(array[index], index)
    if (data) return array[index]
  }
  return null
}

/* 监听节点插入 */
function listenerDOMInsertedBySelector(selector, callback) {
  return new Promise((resolve, reject) => {
    const target = document.querySelector(selector)
    console.log(target)
    const func = (event, relateNode) => {
      console.log('==> DOMNodeInserted', selector, event)
      return callback(event)
    }
    if (target) {
      target.addEventListener('DOMNodeInserted', (event, relateNode) => {
        const result = func(event, relateNode)
        if (result) {
          resolve(result)
          target.removeEventListener('DOMNodeInserted', func)
        }
      })
    }
  })
}

/* 监听节点变化 */
function listenerDOMModifiedBySelector(selector, callback) {
  return new Promise((resolve, reject) => {
    const target = document.querySelector(selector)
    console.log(target)
    const func = (event) => {
      console.log('==> DOMSubtreeModified', selector, event)
      return callback(event)
    }
    if (target) {
      target.addEventListener('DOMSubtreeModified', (event) => {
        const result = func(event)
        if (result) {
          resolve(result)
          target.removeEventListener('DOMSubtreeModified', func)
        }
      })
    }
  })
}
