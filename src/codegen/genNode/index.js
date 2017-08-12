import genComment from './genComment'
import genText from './genText'
import { genElement } from '../index'


// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
// function getNormalizationType ( children, maybeComponent) {
// 	let res = 0
// 	for (let i = 0; i < children.length; i++) {
// 		const el = children[i]
// 		if (el.type !== 1) {
// 			continue
// 		}
// 		if (needsNormalization(el) ||
// 			(el.ifConditions && el.ifConditions.some(c => needsNormalization(c.block)))) {
// 			res = 2
// 			break
// 		}
// 		if (maybeComponent(el) ||
// 			(el.ifConditions && el.ifConditions.some(c => maybeComponent(c.block)))) {
// 			res = 1
// 		}
// 	}
//   return res
// }

// function needsNormalization (el) {
//   return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
// }

function genNode (node) {
    if (node.type === 1) {
        return genElement(node)
    } if (node.type === 3 && node.isComment) {
        return genComment(node)
    } else {
        return genText(node)
    }
}

export default function genChildren (el, altGenElement, altGenNode) {
    const children = el.children
    if (children.length) {
        const el = children[0]
        // optimize single v-for
        // if (children.length === 1 &&
        //   el.for &&
        //   el.tag !== 'template' &&
        //   el.tag !== 'slot'
        // ) {
        //   return (altGenElement || genElement)(el)
        // }

        // const normalizationType = checkSkip
        //   ? getNormalizationType(children, state.maybeComponent)
        //   : 0
        const gen = altGenNode || genNode
        return `[${children.map(c => gen(c)).join(',')}]`
    }
}