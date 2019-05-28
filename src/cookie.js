const pairSplitRegExp = /; */
const decode = decodeURIComponent

function tryDecode(str, decode) {
  try {
    return decode(str)
  } catch (e) {
    return str
  }
}

function parseCookie(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string')
  }

  const obj = {}
  const opt = options || {}
  const pairs = str.split(pairSplitRegExp)
  const dec = opt.decode || decode

  for (let i = 0; i < pairs.length; i++) {
    let pair = pairs[i]
    let eqIdx = pair.indexOf('=')

    // skip things that don't look like key=value
    if (eqIdx < 0) {
      continue
    }

    let key = pair.substr(0, eqIdx).trim()
    let val = pair.substr(++eqIdx, pair.length).trim()

    // quoted values
    if (val[0] === '"') {
      val = val.slice(1, -1)
    }

    // only assign once
    if (undefined === obj[key]) {
      obj[key] = tryDecode(val, dec)
    }
  }

  return obj
}

exports.parseCookie = parseCookie
