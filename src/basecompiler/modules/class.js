/* @flow */

import { parseText } from '../../text-parser'
import { getAndRemoveAttr,getBindingAttr } from '../../modify-utils'

function transformNode (el, options) {
    const staticClass = getAndRemoveAttr(el, 'class')

    if (staticClass) {
        const expression = parseText(staticClass)
        if (expression) {
            //warn
            //'instead of <div class="{{ val }}">, use <div :class="val">.'
        }
        el.staticClass = JSON.stringify(staticClass)
    }
    //:class="val"
    //不许写filter了..
    //true 代表只要动态值
    const classBinding = getBindingAttr(el, 'class', true)
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
