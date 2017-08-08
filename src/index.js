import { Parser } from './html-parser.js'
import { init, tagPush, tagPop, chars, comment, out} from './ast.js'

let parser = new Parser({
	init:init,
	tagPush:tagPush,
	tagPop:tagPop,
	chars:chars,
	comment:comment,
	out:out
})

export default parser