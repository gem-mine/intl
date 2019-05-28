/* global expect */
const intl = require('../lib')
const IntlMessageFormat = require('intl-messageformat')
const { defaultFormats } = require('../lib/constants')
const { xss } = require('../lib/helper')

function format(key, data) {
  const { data: locale, currentLocale } = intl.options
  return new IntlMessageFormat(locale[key], currentLocale, defaultFormats).format(data)
}

function expectKD(key, data) {
  expect(intl.get(key, data)).toBe(format(key, data))
}

function expectHTMLKD(key, data) {
  const r = intl.getHTML(key, data)
  expect(r.props.dangerouslySetInnerHTML.__html).toBe(format(key, xss(data)))
}

function baseTest() {
  const { data } = intl.options
  expect(intl.get('home')).toBe(data.home)
  expect(intl.get('SIMPLE')).toBe(data.SIMPLE)
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
}

exports.baseTest = baseTest
