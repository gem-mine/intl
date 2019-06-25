/* global expect */
const intl = require('../lib')
const IntlMessageFormat = require('intl-messageformat')
const { defaultFormats } = require('../lib/constants')
const { xss } = require('../lib/helper')

function format(key, data) {
  const { data: locale, currentLocale } = intl.options
  return new IntlMessageFormat(locale[key], currentLocale, defaultFormats).format(data)
}

// 取得到值，但没给 defaultValue
function expectKD(key, data) {
  expect(intl.get(key, data)).toBe(format(key, data))
}

// 取得到值，并且给了 defaultValue
function expectKDDV(key, defaultValue, data) {
  expect(intl.get(key, defaultValue, data)).toBe(format(key, data))
}

// getHTML 取得到值，但没给 defaultValue
function expectHTMLKD(key, data) {
  const r = intl.getHTML(key, data)
  expect(r.props.dangerouslySetInnerHTML.__html).toBe(format(key, xss(data)))
}

// getHTML 取得到值，并且给了 defaultValue
function expectHTMLKDDV(key, defaultValue, data) {
  const r = intl.getHTML(key, defaultValue, data)
  expect(r.props.dangerouslySetInnerHTML.__html).toBe(format(key, xss(data)))
}

// getHTML 取不到值，r 是 getHTML 的结果
function expectHTMLKDNE(r, v) {
  expect(r.props.dangerouslySetInnerHTML.__html).toBe(v)
}

// formatHTMLMessage 取得到值，并且给了 defaultValue
function expectFTM(p, data) {
  const r = intl.formatHTMLMessage(p, data)
  expect(r.props.dangerouslySetInnerHTML.__html).toBe(format(p.id, xss(data)))
}

// formatHTMLMessage 没有取得到值
function expectFTMNE(p, data) {
  const r = intl.formatHTMLMessage(p, data)
  expect(r.props.dangerouslySetInnerHTML.__html).toBe(p.defaultMessage || p.id)
}

function baseTest() {
  const { data } = intl.options
  // 取到简单值
  expect(intl.get('home')).toBe(data.home)
  expect(intl.get('SIMPLE')).toBe(data.SIMPLE)

  // 没取到值
  expect(intl.get('NOT_EXIST')).toBe('NOT_EXIST')
  expect(intl.get('NOT_EXIST', 'defaultValue')).toBe('defaultValue')
  expect(intl.get('NOT_EXIST', { age: 22 })).toBe('NOT_EXIST')
  expect(intl.get('NOT_EXIST', 'defaultValue', { age: 22 })).toBe('defaultValue')

  // getHTML 且没取到值
  expectHTMLKDNE(intl.getHTML('NOT_EXIST'), 'NOT_EXIST')
  expectHTMLKDNE(intl.getHTML('NOT_EXIST', 'defaultValue'), 'defaultValue')
  expectHTMLKDNE(intl.getHTML('NOT_EXIST', { message: 'html' }), 'NOT_EXIST')
  expectHTMLKDNE(intl.getHTML('NOT_EXIST', 'defaultValue', { message: 'html' }), 'defaultValue')

  // formatMessage
  expect(intl.formatMessage({ id: 'home' })).toBe(data.home)
  expect(intl.formatMessage({ id: 'HELLO' }, { name: 'poly', where: 'China' })).toBe(format('HELLO', { name: 'poly', where: 'China' }))
  expect(intl.formatMessage({ id: 'NOT_EXIST' })).toBe('NOT_EXIST')
  expect(intl.formatMessage({ id: 'NOT_EXIST', defaultMessage: 'defaultValue' })).toBe('defaultValue')

  // formatHTMLMessage
  expectFTM({ id: 'TIP' })
  expectFTM({ id: 'TIP', defaultValue: 'defaultValue' })
  expectFTM({ id: 'TIP_VAR' }, { message: 'HTML with variables' })
  expectFTM({ id: 'TIP_VAR', defaultValue: 'defaultValue' }, { message: 'HTML with variables' })
  expectFTMNE({ id: 'NOT_EXIST' })
  expectFTMNE({ id: 'NOT_EXIST', defaultValue: 'defaultValue' })
  expectFTMNE({ id: 'NOT_EXIST' }, { age: 22 })
  expectFTMNE({ id: 'NOT_EXIST', defaultValue: 'biubiu' }, { age: 30 })

  // 取到值
  expectKD('HELLO', { name: 'tom', where: 'China' })
  expectKD('SALE_PRICE', { price: 123456.78 })
  expectKD('SALE_START', { start: new Date() })
  expectKD('SALE_END', { end: new Date() })
  expectKD('COUPON', { expires: new Date() })
  expectKD('PHOTO', { photoNum: 0 })
  expectKD('PHOTO', { photoNum: 1 })
  expectKD('PHOTO', { photoNum: 1000000 })
  expectHTMLKD('TIP')
  expectHTMLKD('TIP_VAR', { message: 'HTML with variables' })
  expectHTMLKD('TIP_VAR', { message: '<script>alert("ReactIntlUniversal prevents from xss attack")</script>' })

  // 取到值，并且提供默认值（默认值不会起作用）
  expectKDDV('HELLO', 'defaultValue', { name: 'tom', where: 'China' })
  expectKDDV('SALE_PRICE', 'defaultValue', { price: 123456.78 })
  expectKDDV('SALE_START', 'defaultValue', { start: new Date() })
  expectKDDV('SALE_END', 'defaultValue', { end: new Date() })
  expectKDDV('COUPON', 'defaultValue', { expires: new Date() })
  expectKDDV('PHOTO', 'defaultValue', { photoNum: 0 })
  expectKDDV('PHOTO', 'defaultValue', { photoNum: 1 })
  expectKDDV('PHOTO', 'defaultValue', { photoNum: 1000000 })
  expectHTMLKDDV('TIP', 'defaultValue')
  expectHTMLKDDV('TIP_VAR', 'defaultValue', { message: 'HTML with variables' })
  expectHTMLKDDV('TIP_VAR', 'defaultValue', { message: '<script>alert("ReactIntlUniversal prevents from xss attack")</script>' })
}

exports.baseTest = baseTest
