//先ban了
export default function genInlineTemplate (el) {
	const ast = el.children[0]
	if (process.env.NODE_ENV !== 'production' && (
	el.children.length > 1 || ast.type !== 1
	)) {
		state.warn('Inline-template components must have exactly one child element.')
	}
	if (ast.type === 1) {
		const inlineRenderFns = generate(ast, state.options)
		return `inlineTemplate:{render:function(){${
		  inlineRenderFns.render
		}},staticRenderFns:[${
		  inlineRenderFns.staticRenderFns.map(code => `function(){${code}}`).join(',')
		}]}`
	}
}