import queryParser from 'query-string'
import escapeHtml from 'escape-html'
import { parseCookie } from './cookie'

function getLocaleFromCookie(options) {
  const { localeParamName } = options
  if (localeParamName) {
    let params = parseCookie(document.cookie)
    if (params) {
      return params[localeParamName]
    }
  }
}

function getLocaleFromURL(options) {
  const { localeParamName } = options
  if (localeParamName) {
    let query = location.search.split('?')
    if (query.length >= 2) {
      let params = queryParser.parse(query[1])
      if (params) {
        if (params[localeParamName]) {
          const locale = params[localeParamName].replace(/\/+$/, '')
          return locale
        }
      }
    }
  }
}

function getLocaleFromBrowser() {
  return navigator.language || navigator.userLanguage
}

/**
 * 获取某个语言中的 key 对应的值，主要针对可能的嵌套，例如 key = 'a.b.c' 分为两种情况处理：
 *  1. 先直接查找 是否存在 'a.b.c' 这个key，即 locale['a.b.c']，有则返回
 *  2. 否则查找 locale.a.b.c，某一层级一旦不存在，直接返回 undefined
 */
function getDescendantProp(locale, key) {
  if (locale[key]) {
    return locale[key]
  }

  const msg = key.split('.').reduce(function (a, b) {
    return a !== undefined ? a[b] : a
  }, locale)

  return msg
}

/**
 * 检测语言机制，默认从 URL、cookie、浏览器中依次获取，直到获取到值为止
 */
function determineLocale(options) {
  try {
    return getLocaleFromURL(options) || getLocaleFromCookie(options) || getLocaleFromBrowser()
  } catch (e) {}
}

/**
 * 格式化语言，例如将 zh-cn 转为 zh-CN
 */
function formatLocale(key) {
  const arr = key.split('-')
  if (arr[1]) {
    arr[1] = arr[1].toUpperCase()
  }
  return arr.join('-')
}

function xss(variables) {
  for (let i in variables) {
    let value = variables[i]
    if (typeof value === 'string' && value.indexOf('<') >= 0 && value.indexOf('>') >= 0) {
      value = escapeHtml(value)
    }
    variables[i] = value
  }
  return variables
}

/**
 * 获取当前可用的语言（运行期使用的语言），规则为：
 * 1. 获取语言，优先级为：编码传入（一般不会传）-> URL -> cookie -> 浏览器语言 -> 默认语言
 * 2. 用此语言去国际化数据中匹配，如果未匹配中，去获取其父级语言（zh-CN 没命中 去获取 zh）
 * 3. 如果父级语言还是没有命中，则获取默认语言（如果语言数据包中没有命中，返回空数据，所以开发过程应该保证必须有默认包）
 * */
function getCurrentLocale(options) {
  const { locale, defaultLocale, locales } = options
  const supportLocales = Object.keys(locales)
  let currentLocale = locale

  // 不在提供的语言列表当中，进行父级语言检查
  if (supportLocales.indexOf(currentLocale) === -1) {
    if (currentLocale.indexOf('-') > -1) {
      const arr = currentLocale.split('-')
      currentLocale = arr[0]
      // 父级语言还是没有，使用默认语言
      if (supportLocales.indexOf(currentLocale) === -1) {
        currentLocale = defaultLocale
      }
    }
  }

  return formatLocale(currentLocale)
}

exports.determineLocale = determineLocale
exports.getDescendantProp = getDescendantProp
exports.getCurrentLocale = getCurrentLocale
exports.xss = xss
