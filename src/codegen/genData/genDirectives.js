import directives from './directives/index'
export default function genDirectives (el){
    const dirs = el.directives
    if (!dirs) return
    let res = 'directives:['

    //tag时候有运行时 tag里的指针如果有一个需要  那tag就有运行时
    let hasRuntime = false
    let i, l, dir, needRuntime
    for (i = 0, l = dirs.length; i < l; i++) {
        dir = dirs[i]
        //当前指令是否需要运行时
        needRuntime = true
        //dir.name == show html on bind ......
        //在此同时 v-on / v-bind 的 wrapData/wrapListeners 也挂载el上了
        //但是v-on v-bind 进入不了el.directives ...所以很矛盾
        //el上不会存在wrapData/wrapListeners
        
        //v-show v-XXXX(自定义)在编译阶段没有对应指令
        //gen为空  needRuntime自然仍为true
        const gen = directives[dir.name]

        if (gen) {
            // compile-time directive that manipulates AST.
            // returns true if it also needs a runtime counterpart.

            // v-model needRuntime
            // gen 有返回值  则需要运行时
            // v-html没有返回值  不用放入data中_c  needRuntime置否
            needRuntime = !!gen(el, dir)
        }
        if (needRuntime) {
            hasRuntime = true
            res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
            //v-xxx 指针的值确定是个value , dirRE解析出来的都是value
            //v-on v-bind的value也是如此
            dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''
            }${
            dir.arg ? `,arg:"${dir.arg}"` : ''
            }${
            //dir.modifiers 是个对象
            dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
            }},`
        }
    }
    if (hasRuntime) {
        return res.slice(0, -1) + ']'
    }
}