// eslint-disable-next-line
String.prototype.defaultMessage = String.prototype.d = function(msg) {
  return this || msg || ''
}

exports.warn = function (...args) {
  if (typeof console !== 'undefined') {
    console.warn.apply(console, args)
  }
}
