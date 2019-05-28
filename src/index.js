import React from 'react'
import IntlMessageFormat from 'intl-messageformat'
import load from 'load-script'
import { defaultFormats, DEFAULT_LOCALE, DEFAULT_LOCALE_PARAM_NAME } from './constants'
import { warn } from './polyfill'
import { getDescendantProp, determineLocale, xss, getCurrentLocale } from './helper'

const shouldPolyfill = !window.Intl

require('intl')

const OPTIONS = {
  locales: {}, // 国际化数据： {"en-US":{"key1":"value1"},"zh-CN":{"key1":"值1"}}
  /**
   * 支持的语言资源列表，用于远程获取国际化资源，可以是 object 或 functon
   * {"en-US":"{host}/en-US/index.json","zh-CN":"{host}/zh-CN/index.json"}
   * function(request) {}
   */
  locale: null, // 传入的语言，正常情况不应该去指定这个值，这个值应该是自动检测得来
  defaultLocale: DEFAULT_LOCALE, // 默认语言，用于自动检测语言失败时使用
  determineLocale: determineLocale, // 没有设置 locale 时自动获取语言的函数，默认会依次 从 URL，cookie，浏览器中获取当前语言信息
  localeParamName: DEFAULT_LOCALE_PARAM_NAME, // 从 URL，cookie 中获取当前语言信息时的参数名
  remotePrefix: 'https://g.alicdn.com/react-intl-universal/locale-data/1.0.0'
}
class IntlUniversal {
  constructor() {
    this._error = 0
    this.options = {}
  }

  init(options) {
    this.options = Object.assign({}, OPTIONS, options)
    this.options.formats = Object.assign({}, this.options.formats, defaultFormats)

    const { request, locales, locale, determineLocale } = this.options
    if (!locale) {
      this.options.locale = determineLocale(this.options)
    }

    const currentLocale = getCurrentLocale(this.options) // 运行期使用的语言
    this.options.currentLocale = currentLocale

    let t = locales[currentLocale]
    let getLocaleFn
    if (t) {
      if (typeof t === 'object') {
        getLocaleFn = () => Promise.resolve(t)
      } else {
        if (request) {
          getLocaleFn = () => {
            return request.call(this, t, currentLocale)
          }
        }
      }
    }
    if (!getLocaleFn) {
      getLocaleFn = () => Promise.reject(new Error(''))
    }
    return getLocaleFn()
      .then(data => {
        this.options.data = data || {}
        return this._init()
      })
      .catch(err => {
        warn(err)
        this._error += 1
        const error = this._error
        if (error === 1) {
          this.options.locale = DEFAULT_LOCALE
          return this.init(this.options)
        } else {
          return this._init()
        }
      })
  }

  /**
   * 获取当前语言
   */
  getLocale() {
    const { locale, currentLocale } = this.options
    return {
      locale,
      currentLocale
    }
  }

  /**
   * 设置当前语言
   */
  setLocale(lang) {
    const { localeParamName } = this.options
    if (location.search) {
      location.search = location.search.replace(new RegExp(`${localeParamName}=?([^&]*)`), `${localeParamName}=${lang}`)
    } else {
      location.search = `?${localeParamName}=${lang}`
    }
  }

  /**
   * Get the formatted message by key
   */
  get(key, variables) {
    const { data, currentLocale, formats } = this.options

    let msg = getDescendantProp(data, key)
    if (msg == null) {
      warn(`"${key}" not defined in ${currentLocale}`)
      return undefined
    }
    if (variables) {
      variables = xss(Object.assign({}, variables))
    }

    try {
      msg = new IntlMessageFormat(msg, currentLocale, formats) // TODO memorize
      msg = msg.format(variables)
      return msg
    } catch (err) {
      warn(`format message failed for key='${key}'`, err)
      return undefined
    }
  }

  /**
   * Get the formatted html message by key.
   */
  getHTML(key, variables) {
    let msg = this.get(key, variables)
    if (msg) {
      const el = React.createElement('span', {
        dangerouslySetInnerHTML: {
          __html: msg
        }
      })
      // when key exists, it should still return element if there's defaultMessage() after getHTML()
      const defaultMessage = () => el
      return Object.assign({ defaultMessage: defaultMessage, d: defaultMessage }, el)
    }
    return ''
  }

  /**
   * As same as get(...) API
   */
  formatMessage({ id, defaultMessage }, variables) {
    return this.get(id, variables).defaultMessage(defaultMessage)
  }

  /**
   * As same as getHTML(...) API
   */
  formatHTMLMessage({ id, defaultMessage }, variables) {
    return this.getHTML(id, variables).defaultMessage(defaultMessage)
  }

  /**
   * Initialize properties and load CLDR locale data according to currentLocale
   * @returns {Promise}
   */
  _init() {
    const { currentLocale, remotePrefix } = this.options
    return new Promise((resolve, reject) => {
      const lang = currentLocale.split('-')[0].split('_')[0]
      if (shouldPolyfill) {
        load(`${remotePrefix}/${lang}.js`, (err, script) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }
}

module.exports = new IntlUniversal()
