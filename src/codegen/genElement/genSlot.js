import genChildren from '../genNode/genChildren'

export default function genSlot (el) {
    //非具名
    const slotName = el.slotName || '"default"'
    //插槽内部还能children的？？？？？？
    const children = genChildren(el)
    let res = `_t(${slotName}${children ? `,${children}` : ''}`

    const attrs = el.attrs && `{${el.attrs.map(a => `${camelize(a.name)}:${a.value}`).join(',')}}`
    const bind = el.attrsMap['v-bind']
    if ((attrs || bind) && !children) {
        res += `,null`
    }
    if (attrs) {
        res += `,${attrs}`
    }
    if (bind) {
        //把attr参数的位置占住
        res += `${attrs ? '' : ',null'},${bind}`
    }
    //_t(slotName,'{tjwyzNb:"emm"}',chidren,attrs,bind)
    return res + ')'
}