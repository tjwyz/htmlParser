//onEvent regular
export const onRE = /^@|^v-on:/
//binding regular
export const bindRE = /^:|^v-bind:/
//direcative regular
export const dirRE = /^v-|^@|^:/



export const argRE = /:(.*)$/

//修饰符 (Modifiers) 是以半角句号 . 指明的特殊后缀，用于指出一个指令应该以特殊方式绑定。
//例如，.prevent 修饰符告诉 v-on 指令对于触发的事件调用 event.preventDefault()：
// /g 全局/贪婪匹配
export const modifierRE = /\.(.+)/