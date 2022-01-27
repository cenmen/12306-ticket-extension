let fromLocationInput = document.querySelector('#fromLocationInput')
let fromLocationSelects = document.querySelector('#fromLocationSelects')
let toLocationInput = document.querySelector('#toLocationInput')
let toLocationSelects = document.querySelector('#toLocationSelects')
let dateInput = document.querySelector('#dateInput')
let startTimeInput = document.querySelector('#startTimeInput')
/* checkBoxs */
let seatsDiv = document.querySelector('.seats')
let passengersDiv = document.querySelector('.passengers')
let addPassengerBtn = document.querySelector('#addPassengerBtn')
let submitBtn = document.querySelector('#submitBtn')
let checkStorageBtn = document.querySelector('#checkStorageBtn')
let clearStorageBtn = document.querySelector('#clearStorageBtn')
let errorDiv = document.querySelector('.error')

fromLocationInput.addEventListener('change', (event) => {
  onChangeLocation(event, '#fromLocationSelects', '#fromLocationInput')
})

toLocationInput.addEventListener('change', (event) => {
  onChangeLocation(event, '#toLocationSelects', '#toLocationInput')
})

addPassengerBtn.addEventListener('click', () => {
  appendInputItem()
})

submitBtn.addEventListener('click', () => {
  submit()
})

clearStorageBtn.addEventListener('click', () => {
  setStorage(null)
})

checkStorageBtn.addEventListener('click', () => {
  getStorage()
})

const dataSource = station_names.split('@').map((item) => item.split('|')) // [拼音简写, 名字, ID, 拼音, 拼音简写, 序号]

function getLocation(name) {
  if (name.length === 0) return []
  return dataSource.filter((data) => data[1].includes(name) || data[3].includes(name))
}

/* 地点搜索 */
function onChangeLocation(event, contentId, targetId) {
  const name = event.target.value
  const list = getLocation(name)
  const container = document.querySelector(contentId)
  /* 临时节点方便删除 */
  const parentDiv = document.createElement('div')
  for (const item of list) {
    const div = document.createElement('div')
    div.setAttribute('data-value', `${item[1]}/${item[2]}`)
    div.classList.add('select-item')
    div.innerText = `${item[1]}/${item[2]}/${item[3]}`
    div.addEventListener('click', (e) => {
      document.querySelector(targetId).value = e.target.dataset.value
      const content = document.querySelector(contentId)
      content.removeChild(parentDiv)
    })
    parentDiv.appendChild(div)
    container.appendChild(parentDiv)
  }
}

/* 添加乘车人 */
function appendInputItem() {
  const MAX_PASSENGERS = 5
  const inputNum = passengersDiv.children.length
  if (inputNum > MAX_PASSENGERS) return
  const input = document.createElement('input')
  input.type = 'text'
  passengersDiv.appendChild(input)
}

function boom(errors) {
  const ul = document.createElement('ul')
  ul.classList.add('ul-errors')
  for (const text of errors) {
    const li = document.createElement('li')
    li.innerText = text
    ul.appendChild(li)
  }
  errorDiv.appendChild(ul)
}

function clearErrors() {
  const ul = document.querySelector('.ul-errors')
  if (ul) errorDiv.removeChild(ul)
}

function validate({ from, fromId, to, toId, date, startTime, business, first, second, passengers }) {
  const datePattern = /^(?:(?:0[1-9])|(?:1[0-2]))-[0-3][0-9]$/
  const timePattern = /^(?:(?:[0-2][0-3])|(?:[0-1][0-9])):[0-5][0-9]$/
  const isBoolean = (val) => typeof val === 'boolean'
  const errors = []
  if (!(from && fromId)) errors.push('出发地格式错误！')
  if (!(to && toId)) errors.push('目的地格式错误！')
  if (!(date && datePattern.test(date))) errors.push('日期格式错误！')
  if (!(startTime && timePattern.test(startTime))) errors.push('时间格式错误！')
  if (!(isBoolean(business) && isBoolean(first) && isBoolean(second))) errors.push('座位格式错误！')
  if (!(Array.isArray(passengers) && passengers.length > 0)) errors.push('乘车人格式错误！')
  if (errors.length > 0) {
    boom(errors)
    return false
  } else {
    return true
  }
}

function submit() {
  clearErrors()
  const [from, fromId] = fromLocationInput.value.split('/')
  const [to, toId] = toLocationInput.value.split('/')
  const date = dateInput.value
  const startTime = startTimeInput.value
  const seatChilds = Array.prototype.slice.call(seatsDiv.children)
  const [business, first, second] = seatChilds.filter((item) => item.localName === 'input').map((item) => item.checked)
  const passengerChilds = Array.prototype.slice.call(passengersDiv.children)
  const passengers = passengerChilds.map((item) => item.value).filter((item) => !!item)
  const options = { from, fromId, to, toId, date, startTime, business, first, second, passengers }
  console.log('==> submit', options)
  const check = validate(options)
  if (check === true) {
    setStorage(options)
  }
}

let STORAGE_KEY = 'TICKET_KEY'
function setStorage(options) {
  chrome.storage.sync.set({ [STORAGE_KEY]: options }, () => {
    console.log('==> setStorage', options)
    if (options) {
      const { from, to, date } = options
      toast(`保存成功。目的地：${from}，到达地：${to}，日期：${date}...`)
    } else {
      toast(`缓存已清除`)
    }
  })
}

function getStorage() {
  chrome.storage.sync.get([STORAGE_KEY], (storage) => {
    console.log('==> getStorage', storage);
    if (storage[STORAGE_KEY]) {
      const content = Object.entries(storage[STORAGE_KEY]).reduce((total, current) => {
        const [key, val] = current
        total = total + `${key}: ${val}\n`
        return total
      }, '')
      toast(content, 8000)
    } else {
      toast('木有缓存！')
    }
  })
}
