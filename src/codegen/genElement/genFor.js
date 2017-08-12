export default function genFor (el, altGen, altHelper) {
    const exp = el.for
    const alias = el.alias
    const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
    const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''

    //是component 被for循环渲染多次 还没写key  报错
    if (state.maybeComponent(el) && el.tag !== 'slot' && el.tag !== 'template' && !el.key) {
        // state.warn(
        //   `<${el.tag} v-for="${alias} in ${exp}">: component lists rendered with ` +
        //   `v-for should have explicit keys. ` +
        //   `See https://vuejs.org/guide/list.html#key for more info.`,
        //   true /* tip */
        // )
        return 
    }

    el.forProcessed = true // avoid recursion
    //${alias}${iterator1}${iterator2} 三个形参没写,  在上面补上了
    //我先补上....可能是之前我ast parser的时候有问题

    //exp是个数组
    return `${altHelper || '_l'}((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
        //循环gen标签自己
        `return ${(altGen || genElement)(el)}` +
    '})'
}