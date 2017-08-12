import { genElement } from '../index'
import genChildren from '../genNode/genChildren'
export default function genScopedSlots (slots) {
  return `scopedSlots:_u([${
    Object.keys(slots).map(key => {
      return genScopedSlot(key, slots[key])
    }).join(',')
  }])`
}

function genScopedSlot (key ,el) {
    if (el.for && !el.forProcessed) {
        return genForScopedSlot(key, el)
    }
    return `{key:${key},fn:function(${String(el.attrsMap.scope)}){` +
    `return ${el.tag === 'template'
      ? genChildren(el) || 'void 0'
      : genElement(el)
    }}}`
}

function genForScopedSlot (key, el) {
    const exp = el.for
    const alias = el.alias
    const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
    const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''
    el.forProcessed = true // avoid recursion
    return `_l((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
      `return ${genScopedSlot(key, el)}` +
    '})'
}
