// hoist static sub-trees out
import { CodegenResult } from '../index'
export default function genStatic (el) {
    el.staticProcessed = true
    CodegenResult.staticRenderFns.push(`with(this){return ${genElement(el)}}`)
    //"_m( 刚push进去的genElement的index ,true)"
    //_m(7,true)
    return `_m(${CodegenResult.staticRenderFns.length - 1}${el.staticInFor ? ',true' : ''})`
}