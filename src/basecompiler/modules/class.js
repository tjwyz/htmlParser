/* @flow */

import { parseText } from '../../text-parser'
import { getAndRemoveAttr,getBindingAttr } from '../../modify-utils'

function transformNode (el, options) {
    const warn = options.warn || baseWarn
    const staticClass = getAndRemoveAttr(el, 'class')

    if (staticClass) {
        if (process.env.NODE_ENV !== 'production') {
            const expression = parseText(staticClass, options.delimiters)
            if (expression) {
                //warn
                //'instead of <div class="{{ val }}">, use <div :class="val">.'
            }
        }
        el.staticClass = JSON.stringify(staticClass)
    }
    //:class="val"
    //不许写filter了..
    const classBinding = getBindingAttr(el, 'class', false /* getStatic */)
    if (classBinding) {
        el.classBinding = classBinding
    }
}

function genData (el) {
  let data = ''
  if (el.staticClass) {
    data += `staticClass:${el.staticClass},`
  }
  if (el.classBinding) {
    data += `class:${el.classBinding},`
  }
  return data
}

export default transformNode
