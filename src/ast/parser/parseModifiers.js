// direcative 指令属性的值后可能接.(即modifier)
import { onRE, bindRE, dirRE, argRE, modifierRE} from '../regular'
export default function parseModifiers (name) {

	let match = name.match(modifierRE)
	match = match && match[1].split(".")

	if (match && match.length) {
		const ret = {}
		match.forEach(m => { ret[m] = true })
		return ret
	}
}