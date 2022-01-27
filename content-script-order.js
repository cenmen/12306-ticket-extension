/* 获取乘车人列表 */
function getPagePassengers() {
  let lis = null
  while (!lis) {
    lis = document.querySelector('#normal_passenger_id').children
  }
  let source = []
  for (const li of lis) {
    if (!li.children[0].disabled) {
      source.push({
        passengerId: li.children[0].id,
        name: li.children[1].innerText,
      })
    }
  }
  return source
}

/* 获取目标乘车人ID */
function getTargetPassengerIds(source, names) {
  const ids = []
  source.forEach((item) => {
    if (names.includes(item.name)) ids.push(item.passengerId)
  })
  return ids
}

/* 提交订单页面 */
async function start(names) {
  toast('等待页面加载')
  await delay(500)
  toast('获取目标乘车人列表数据')
  const passengers = getPagePassengers()
  const passengerIds = getTargetPassengerIds(passengers, names)
  console.log('==> passengerIds', passengerIds)
  if (passengerIds.length !== names.length)
    return toast(`目标乘车人匹配失败！页面乘车人列表：${JSON.stringify(passengers.map((val) => val.name))}。目标乘车人：${JSON.stringify(names)}`, 15000)
  passengerIds.forEach((id) => document.querySelector(`#${id}`).click())
  document.querySelector('#submitOrder_id').click()
  /* 确认提交弹窗 */
  await listenerDOMInsertedBySelector('body', (event) => event.target.classList && event.target.classList.value.includes('dhtmlx_wins_body_outer'))
  /* 等待确认弹窗 */
  await delay(1000)
  const confirm = document.querySelector('#qr_submit_id')
  confirm.click()
  notifications(`${JSON.stringify(names)}抢票成功！请尽快支付。`)
}

function getStorage() {
  let STORAGE_KEY = 'TICKET_KEY'
  chrome.storage.sync.get([STORAGE_KEY], (storage) => {
    console.log('==> getStorage', storage)
    storage[STORAGE_KEY] ? start(storage[STORAGE_KEY].passengers) : toast('找不到缓存！')
  })
}

getStorage()

function notifications(content) {
  chrome.notifications.create(
    Math.random() + '', // id
    {
      type: 'basic',
      iconUrl: './images/logo.jpg',
      title: '12306抢票插件',
      message: content,
      eventTime: Date.now() + 2000,
    }
  )
}
