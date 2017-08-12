/* @flow */
//
export default function bind (el, direcative) {
	/*  direcative
	arg:"emm"
	modifiers:{abcd: true, efgh: true}
	name:"show"
	rawName:"v-show:emm.abcd.efgh"
	value:"show"
	*/
	el.wrapData = (code) => {
		return `_b(${code},'${el.tag}',${direcative.value},${
		direcative.modifiers && direcative.modifiers.prop ? 'true' : 'false'
		}${
		direcative.modifiers && direcative.modifiers.sync ? ',true' : ''
		})`
	}
}
