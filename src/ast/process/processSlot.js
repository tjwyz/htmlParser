import { getBindingAttr , getAndRemoveAttr } from '../modifier'
export default function processSlot (el) {	

/*app-layout
<div class="container">
	<header>
		<slot name="header"></slot>
	</header>
	<main>
		<slot></slot>
	</main>
	<footer>
		<slot name="footer"></slot>
	</footer>
</div>
 */

/**
<app-layout>
	<h1 slot="header">这里可能是一个页面标题</h1>

	<p>主要内容的一个段落。</p>
	<p>另一个主要段落。</p>

	<p slot="footer">这里有一些联系信息</p>
</app-layout>
 */

	//组件内 使用tag=='slot'  <slot name='aaa'></slot>
	if (el.tag === 'slot') {
		el.slotName = getBindingAttr(el, 'name')
	} else {

		const slotTarget = getBindingAttr(el, 'slot')
		if (slotTarget) {
			el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
		}
		if (el.tag === 'template') {
			el.slotScope = getAndRemoveAttr(el, 'scope')
		}
	}
}