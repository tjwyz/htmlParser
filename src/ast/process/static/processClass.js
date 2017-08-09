import { getAndRemoveAttr,getBindingAttr } from '../../modifier'

export default function processClass (el) {
    const staticClass = getAndRemoveAttr(el, 'class')

    if (staticClass) {
        //warn
        //'instead of <div class="{{ val }}">, use <div :class="val">.'
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
