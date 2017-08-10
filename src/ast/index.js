import htmlParser from '../html/index'
import { makeAttrsMap } from './modifier'

import { processAttrs, processComponent, processFor, processIf, processIfConditions, addIfCondition, processKey, processOnce, processRef, processSlot, processClass, processStyle} from './process/index'
import { parseFilters, parseModifiers, parseTexts } from './parser/index'

export default class Parser extends htmlParser{
	constructor (html) {
		super();

		this.html = html;
        this.raw = html;

		this.astStack = [];
		//向外暴露的根节点
		this.root;
		this.currentParent;
	}
	tagPush (tag, attrs, unary, start ,end) {

		//attrsList 原始属性  attrsMap 原始属性对应表
		let element = {
			type: 1,
			tag,
			attrsList: attrs,
			attrsMap: makeAttrsMap(attrs),
			currentParent:this.currentParent,
			children: [],
			start
		}

		// structural directives
		// 改变dom的指令
		processFor(element)
		processIf(element)
		processOnce(element)
		// element-scope stuff
		// 特殊特性
		processKey(element)

		// determine whether this is a plain element after
		// removing structural attributes'
		// 在此之前会清attrsList
		element.plain = !element.key && !element.attrsList.length
		
		processRef(element)
		processSlot(element)
		processComponent(element)
		
		//static start
		processClass(element)
		processStyle(element)
		//static end
		
		processAttrs(element)


		// tree management
		if (!this.root) {
			this.root = element
		} else if (!this.astStack.length) {
			//两个并列节点...只能是if/else那种  不然就该报错


			// 根节点并列的情况只允许 template v-if/esle
			// allow root elements with v-if, v-else-if and v-else
			if (this.root.if && (element.elseif || element.else)) {
				addIfCondition(this.root, {
					exp: element.elseif,
					block: element
				})
			}
		}

		//为当前parent添加children
		//this.currentParent 为当前父节点
		//element 正常进入parent.children   而else/elseif进的是上一个兄弟if的ifConditions
		if (this.currentParent) {
			
			if (element.elseif || element.else) {
				processIfConditions(element, this.currentParent)
			} else if (element.slotScope) { // scoped slot
			  this.currentParent.plain = false
			  const name = element.slotTarget || '"default"'
			  ;(this.currentParent.scopedSlots || (this.currentParent.scopedSlots = {}))[name] = element
			} else {
				this.currentParent.children.push(element)
				element.parent = this.currentParent
			}
		}
		//成为parent
		if (!unary) {
			this.currentParent = element
			//历史记录
			this.astStack.push(element)
		} else {
			//正常标签是在tagPop时记录
			//但单标签是push时记录 因为没children
			element.end = end
			element.raw = this.raw.slice(element.start, element.end)
		}
	}
	tagPop (tag, start, end) {

		// remove trailing whitespace
		const element = this.astStack[this.astStack.length - 1]
		const lastNode = element.children[element.children.length - 1]
		//当前一个标签要闭合的时候 可能有trailing whitespace
		//如果有则去掉
		if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
			element.children.pop()
		}

		element.end = end
		element.raw = this.raw.slice(element.start, element.end)
		// pop stack
		this.astStack.length -= 1
		this.currentParent = this.astStack[this.astStack.length - 1]
	}
	chars (text, start, end) {
		//当前没tag
		if (!this.currentParent) {
			return
		}

		const children = this.currentParent.children
		text = text.trim()
		// vue里可能存在text分两段chars的情况？
		// ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
		// // only preserve whitespace if its not right after a starting tag
		// : preserveWhitespace && children.length ? ' ' : ''
		if (text) {
			let res,expression
			//delimiters值修改文案默认分隔符
			//["{{", "}}"] 默认值
			
			//{{}}
			if (text !== ' ' && (expression = parseTexts(text))) {
				let element = {
					type: 2,
					expression,
					text,
					start,
					end
				}
				element.raw = this.raw.slice(element.start, element.end)
				children.push(element)
			//plaintext 
			} else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
				let element = {
					type: 3,
					text,
					start,
					end
				}
				element.raw = this.raw.slice(element.start, element.end)
				children.push(element)
			}
		}
	}
	comment (text, start, end){
		this.currentParent.children.push({
			type: 3,
			text,
			isComment: true,
			start,
			end
		})
	}
}
