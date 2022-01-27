/* 操作触发查询列表数据 */
async function queryDataList(from, to, date) {
  document.querySelector('#fromStation').value = from
  document.querySelector('#toStation').value = to
  document.querySelector('#query_ticket').click()
  await delay(1000)
  const lis = document.querySelector('#date_range').firstChild.children
  const item = find(lis, (val) => val.firstChild.innerText === date)
  if (item) {
    item.click()
    return true
  } else {
    toast(`没有找到对应日期（一般为未来的两周内的日期）！你的输入日期为：${date}`, 8000)
    return false
  }
}

/* 将页面表格数据整理 */
function getTableDataList() {
  const tbody = document.querySelector('#queryLeftTable')
  let rows = []
  for (const tr of tbody.children) {
    if (tr.style.display !== 'none') {
      rows.push(tr)
    }
  }

  const list = map(rows, (tr) => {
    const detail = (() => {
      const td = tr.firstChild
      const items = td.firstChild.children
      /* 车次 */
      const train = items[0].firstChild.firstChild.innerText
      /* 出发|到达站 */
      const [from, to] = map(items[1].children, (val) => val.innerText)
      /* 出发|到达时间 */
      const [startTime, arrivalTime] = map(items[2].children, (val) => val.innerText)
      return { train, from, to, startTime, arrivalTime }
    })()

    const checkClass = (td) => {
      const text = td.firstChild.innerText || td.innerText
      const exist = !isNaN(Number(text)) || text === '有'
      return { text, exist }
    }
    /* 特等座 */
    const businessClass = checkClass(tr.children[1])
    /* 一等座 */
    const firstClass = checkClass(tr.children[2])
    /* 二等座 */
    const secondClass = checkClass(tr.children[3])
    const data = {
      rowId: tr.id,
      ...detail,
      businessClass,
      firstClass,
      secondClass,
    }
    return data
  })
  return list
}

/* 过滤列表其他车次 */
function filterTrain(dataList, { from, to, startTime, business, first, second }) {
  const isAfter = (target, compare) => {
    const [targetHour, targetMin] = target.split(':')
    const [compareHour, compareMin] = compare.split(':')
    if (targetHour > compareHour) {
      return true
    } else if (targetHour === compareHour && targetMin > compareMin) {
      return true
    } else {
      return false
    }
  }
  return dataList.filter((item) => {
    const FROM = item.from === from
    const TO = item.to === to
    const STARTTIME = startTime ? isAfter(item.startTime, startTime) : true
    const BUSINESS = business ? item.businessClass.exist === business : true
    const FIRST = first ? item.firstClass.exist === first : true
    const SECOND = second ? item.secondClass.exist === second : true
    return FROM && TO && STARTTIME && (BUSINESS || FIRST || SECOND)
  })
}

/* 点击列表行的预订 */
function book(selector) {
  document.querySelector(selector).lastChild.firstChild.click()
}

/* 车次列表页 */
async function start(options) {
  const { from, fromId, to, toId, date, startTime, business, first, second } = options
  /* 是否启用疯狂重试 */
  const RETRY = true
  /* 查询列车 */
  const res = await queryDataList(fromId, toId, date)
  if (!res) return
  await delay(1000)
  /* 获取列表数据 */
  const dataList = getTableDataList()
  toast('列表数据解析完成')
  console.log(dataList)
  /* 过滤站点车次获取行ID */
  const filters = filterTrain(dataList, { from, to, startTime, business, first, second })
  console.log('==> 过滤后车次', filters)
  console.log('==> 目标预订车次', filters[0])
  if (filters[0]) {
    toast(`过滤列表数据完成，选取目标出发时间为 ${filters[0].startTime} 的预订车次：${filters[0].rowId}`)
    /* 预订 */
    return book(`#${filters[0].rowId}`)
  } else if (RETRY) {
    toast('没有符合的目标车次，准备重新加载！')
    await delay(10000)
    return start(options)
  }
}

function getStorage() {
  let STORAGE_KEY = 'TICKET_KEY'
  chrome.storage.sync.get([STORAGE_KEY], (storage) => {
    console.log('==> getStorage', storage)
    storage[STORAGE_KEY] ? start(storage[STORAGE_KEY]) : toast('找不到缓存！', 5000)
  })
}

/* 自动关闭页面弹窗 */
function autoClosePageModal() {
  const target = document.querySelector('#gb_closeDefaultWarningWindowDialog_id')
  if (target) target.click()
}

;(async () => {
  getStorage()
  autoClosePageModal()
})()
