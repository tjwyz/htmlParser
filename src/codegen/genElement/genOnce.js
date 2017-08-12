// v-once
import { genElement } from '../index'
import genStatic from './genStatic'

export default function genOnce (el) {
    el.onceProcessed = true
    if (el.if && !el.ifProcessed) {
        return genIf(el)
    } else if (el.staticInFor) {
        let key = ''
        let parent = el.parent
        while (parent) {
            if (parent.for) {
                key = parent.key
                break
            }
            parent = parent.parent
        }
        if (!key) {
            // process.env.NODE_ENV !== 'production' && state.warn(
            // `v-once can only be used inside v-for that is keyed. `)
            return genElement(el)
        }
        return `_o(${genElement(el)},${state.onceId++}${key ? `,${key}` : ``})`
    } else {
        //normal
        return genStatic(el)
    }
}