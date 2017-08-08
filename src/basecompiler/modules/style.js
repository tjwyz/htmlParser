/* @flow */

import { parseText } from '../../text-parser'
// import { parseStyleText } from 'web/util/style'
import { getAndRemoveAttr,getBindingAttr } from '../../modify-utils'


// 
function parseStyleText (cssText) {
  const res = {}
  //;
  const listDelimiter = /;(?![^(]*\))/g
  //:
  const propertyDelimiter = /:(.+)/
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter)
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim())
    }
  })
  return res
}

function transformNode (el, options) {
    const warn = options.warn || baseWarn
    const staticStyle = getAndRemoveAttr(el, 'style')
    if (staticStyle) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
            const expression = parseText(staticStyle, options.delimiters)
            if (expression) {
                //warn
                //'instead of <div style="{{ val }}">, use <div :style="val">.'
            }
        }
        // "position:absolute;z-index:1" to "{"position":"absolute","z-index":"1"}"
        el.staticStyle = JSON.stringify(parseStyleText(staticStyle))
    }

    const styleBinding = getBindingAttr(el, 'style')
    if (styleBinding) {
        el.styleBinding = styleBinding
    }
}

function genData (el) {
  let data = ''
  if (el.staticStyle) {
    data += `staticStyle:${el.staticStyle},`
  }
  if (el.styleBinding) {
    data += `style:(${el.styleBinding}),`
  }
  return data
}

export default transformNode
