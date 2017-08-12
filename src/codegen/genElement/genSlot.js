import genChildren from '../genNode/genChildren'

export default function genSlot (el) {
    const slotName = el.slotName || '"default"'
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
    res += `${attrs ? '' : ',null'},${bind}`
    }
    return res + ')'
}