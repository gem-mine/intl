/* global expect, beforeAll */
const intl = require('../lib')
const axios = require('axios')
const { baseTest } = require('./helper')

const PREFIX = 'http://gem-mine.oss-cn-hangzhou.aliyuncs.com'

function getLocales() {
  const result = {}
  const arr = ['en', 'zh-CN', 'zh-HK']
  arr.forEach(key => {
    result[key] = `${PREFIX}/${key}.json`
  })
  return result
}

function request(url) {
  return axios.get(url).then(res => {
    return res.data
  })
}

describe('远程方案 - 浏览器默认 en-US（无此数据），会使用远程 en 源', () => {
  beforeAll(async () => {
    await intl.init({
      locales: getLocales(),
      request
    })
  })

  it('基准测试', () => {
    const { currentLocale, locale } = intl.getLocale()
    expect('en-US').toEqual(locale)
    expect('en').toEqual(currentLocale)
    baseTest()
  })
})

describe('远程方案 - 指定使用远程 zh-CN 源', () => {
  beforeAll(async () => {
    await intl.init({
      locale: 'zh-CN',
      locales: getLocales(),
      request
    })
  })

  it('基准测试', () => {
    const { currentLocale, locale } = intl.getLocale()
    expect('zh-CN').toEqual(locale)
    expect('zh-CN').toEqual(currentLocale)
    baseTest()
  })
})

describe('远程方案 - 指定使用远程 zh-CW 源，但 locale 中未配置，将使用默认 zh-CN', () => {
  beforeAll(async () => {
    await intl.init({
      locale: 'zh-CW',
      locales: getLocales(),
      request
    })
  })

  it('基准测试', () => {
    const { currentLocale, locale } = intl.getLocale()
    expect('zh-CW').toEqual(locale)
    expect('zh-CN').toEqual(currentLocale)
    baseTest()
  })
})

describe('远程方案 - 指定使用远程 zh-CW 源，但此源不存在，会切换使用 zh-CN 源', () => {
  beforeAll(async () => {
    await intl.init({
      locale: 'zh-CW',
      locales: Object.assign(
        {
          'zh-CW': `${PREFIX}/zh-CW.json`
        },
        getLocales()
      ),
      request
    })
  })

  it('基准测试', () => {
    const { currentLocale, locale } = intl.getLocale()
    expect('zh-CN').toEqual(locale)
    expect('zh-CN').toEqual(currentLocale)
    baseTest()
  })
})

describe('远程方案 - locales 混用远程和本地数据，且使用的是本地源', () => {
  beforeAll(async () => {
    await intl.init({
      locales: {
        en: require('./data/en.json'),
        'zh-CN': `${PREFIX}/zh-CN.json`
      },
      request
    })
  })

  it('基准测试', () => {
    const { currentLocale, locale } = intl.getLocale()
    expect('en-US').toEqual(locale)
    expect('en').toEqual(currentLocale)
    baseTest()
  })
})

describe('远程方案 - locales 混用远程和本地数据，且使用的是远程源', () => {
  beforeAll(async () => {
    await intl.init({
      locale: 'zh-CN',
      locales: {
        en: require('./data/en.json'),
        'zh-CN': `${PREFIX}/zh-CN.json`
      },
      request
    })
  })

  it('基准测试', () => {
    const { currentLocale, locale } = intl.getLocale()
    expect('zh-CN').toEqual(locale)
    expect('zh-CN').toEqual(currentLocale)
    baseTest()
  })
})
