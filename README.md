@gem-mine/intl 国际化方案（含本地、远程国际化资源方案）

## 安装

```bash
$ npm install @gem-mine/intl --save
```

## 使用

建议至少保留一个本地国际化资源，推荐中文

```js
import intl from '@gem-mine/intl'
import axios from 'axios'

intl.init({
  locales: {
    'zh-CN': require('path/to/zh-CN') // 本地资源
    'en': 'http://url.for.en.resource' // 远程资源
  }，
  request(url, lang) {
    return axios.get(url).then(res => {
      return res.data
    })
  }
}).then(() => {
  // 国际化资源已经准备好
})
```

如果语言包很小，建议全部使用本地化

```js
import intl from '@gem-mine/intl'

intl.init({
  locales: {
    'zh-CN': require('path/to/zh-CN')
    'en': require('path/to/en')
  }
}).then(() => {
  // 国际化资源已经准备好
})
```

接入 react 实践：

```js
class App extends Component {
  state = { initDone: false }

  componentDidMount() {
    intl
      .init({
        locales: {
          'zh-CN': require('locales/zh-CN.json'),
          en: 'http://url.for.i18n.en.json'
        }，
        request(url, lang) {
          return axios.get(url).then(res => {
            return res.data
          })
        }
      })
      .then(() => {
        this.setState({ initDone: true })
      })
  }

  render() {
    if (this.state.initDone) {
      return <div>加载你的应用</div>
    } else {
      return <div>loading...</div>
    }
  }
}
```

## API

### init

初始化

```js
intl.init({
  locales: {},
  request(url, lang) {} // 可选，仅在包含远程资源时使用
})
```

- locales，语言资源。key 是语言名称，value 可以是：
  _ json 对象，包含该语言的资源数据
  _ url，通过 request 请求此 url 得到语言资源
- request 是请求远程语言资源的处理函数，可以在这里根据业务进行请求。只要 locales 中存在的语言资源非对象情况，就会调用 request，例如：

```js
intl.init({
  locales: {
    zh: require('path/to/zh.json'), //不会调用
    en: 'http://url.for.en.json', // 会调用，url= 'http://url.for.en.json', lang='en'
    'zh-HK': '' // 会调用，url= '', lang='zh-HK'
  },
  request(url, lang) {} // 可选，仅在包含远程资源时使用
})
```

init 还具有以下较少被使用的参数：

- defaultLocale：默认语言名称，如果不指定，默认语言是指 zh-CN
- determineLocale(options)：自动检测语言机制函数，默认按 URL -> cookie -> 浏览器语言 优先级来检测
- localeParamName：从 URL、cookie 中获取语言的参数名，默认是 lang

@gem-mine/intl 中获取当前可用的语言（运行期使用的语言），规则为：

1. 自动检测语言，优先级为： determineLocale 机制 -> 默认语言（defaultLocale）
2. 用检测到的语言去国际化数据（locales）中匹配，如果未匹配中，去获取其父级语言（zh-CN 没命中 去获取 zh）
3. 如果父级语言还是没有命中，则获取默认语言（如果语言数据包中没有命中，返回空数据，所以开发过程应该保证必须有默认包）

### get(key[, data])

获取国际化词条

```js
intl.get('key')
intl.get('key', { name: 'tom' })
```

key 除了是简单字符串外，还可以是 `.` 连接的字符串，例如：`a.b.c` 此时查找原则为：

- 全匹配，即查找语言资源中是否存在 `key = 'a.b.c'`，找到直接返回
- 没找到，逐级查找，适配于资源用于层级的写法。没找到返回 undefined（中间层级不存在时就会返回，例如 b 层级不存在就会直接返回 undefined）

### formatMessage({id, defaultValue}[, data])

等同于 get，为了适配 react-intl

### getHTML(key[, data])

获取包含 HTML 国际化词条

```js
intl.getHTML('TIP')
intl.getHTML('TIP', { name: 'tom' })
```

### formatHTMLMessage({id, defaultValue}[, data])

等同于 getHTML，为了适配 react-intl

### setLocale(lang)

在浏览器端切换语言，通过修改浏览器的 url search 参数，会进行浏览器刷新

```js
intl.setLocale('zh-CN')
```

### getLocale()

获取语言，包括了当前设置的语言和当前运行的语言，这二者可能是同一个，也有可能不一致，例如：

- 当前设置的语言是 zh-CN，而语言资源中有，因此运行的语言也是 zh-CN
- 当前设置的语言是 en-US，而语言资源中有 en 但是没有 en-US，因此运行的语言是 en

```js
{
  locale: 设置的语言,
  currentLocale: 当前运行的语言
}
```

## 鸣谢

- [react-intl-universal](https://github.com/alibaba/react-intl-universal)
