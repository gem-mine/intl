/* global expect, beforeAll */
const intl = require('../lib')
const locales = {
  en: require('./data/en.json'),
  'zh-CN': require('./data/zh-CN.json'),
  'zh-HK': require('./data/zh-HK.json')
}
const { baseTest } = require('./helper')

describe('本地方案 - 仅传 locales 参数，获取到默认语言 en-US', () => {
  beforeAll(async () => {
    await intl.init({
      locales
    })
  })

  it('基准测试', () => {
    const { data } = intl.options
    const { currentLocale, locale } = intl.getLocale()
    expect('en-US').toEqual(locale)
    expect('en').toEqual(currentLocale)
    expect(data).toEqual(locales.en)
    baseTest()
  })
})

describe('本地方案 - 传 locales 参数，并设定语言 zh-CN', () => {
  const lang = 'zh-CN'
  beforeAll(async () => {
    await intl.init({
      locales,
      locale: lang
    })
  })

  it('基准测试', () => {
    const { data } = intl.options
    const { currentLocale, locale } = intl.getLocale()
    expect(lang).toEqual(locale)
    expect(lang).toEqual(currentLocale)
    expect(data).toEqual(locales[currentLocale])
    baseTest()
  })
})

describe('本地方案 - 传 locales 参数，并设定语言 zh-HK', () => {
  const lang = 'zh-HK'
  beforeAll(async () => {
    await intl.init({
      locales,
      locale: lang
    })
  })

  it('基准测试', () => {
    const { data } = intl.options
    const { currentLocale, locale } = intl.getLocale()
    expect(lang).toEqual(locale)
    expect(lang).toEqual(currentLocale)
    expect(data).toEqual(locales[currentLocale])
    baseTest()
  })
})

describe('本地方案 - 传 locales 参数，并设定语言 zh-CW（不存在），会使用默认语言 zh-CN', () => {
  const lang = 'zh-CW'
  beforeAll(async () => {
    await intl.init({
      locales,
      locale: lang
    })
  })

  it('基准测试', () => {
    const { data } = intl.options
    const { currentLocale, locale } = intl.getLocale()
    expect(lang).toEqual(locale)
    expect('zh-CN').toEqual(currentLocale)
    expect(data).toEqual(locales[currentLocale])
    baseTest()
  })
})
