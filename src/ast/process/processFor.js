import { getAndRemoveAttr } from '../modifier'

export const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/
//item in items  (item, index) of items   (value, key, index) in object
export const forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/

export default function processFor (el) {
	//v-for="tab in tabs"
	let exp
	if ((exp = getAndRemoveAttr(el, 'v-for'))) {
		// exp == "tab in tabs"
		const inMatch = exp.match(forAliasRE)
		//tabs
		el.for = inMatch[2].trim()
		//tab (item, index) (value, key, index)
		const alias = inMatch[1].trim()
		const iteratorMatch = alias.match(forIteratorRE)

		if (iteratorMatch) {
			//tab
			el.alias = iteratorMatch[1].trim()
			//item
			el.iterator1 = iteratorMatch[2].trim()
			if (iteratorMatch[3]) {
				el.iterator2 = iteratorMatch[3].trim()
			}
		} else {
			el.alias = alias
		}
	}
	//element.for == tabs
	//element.alias == tab
}