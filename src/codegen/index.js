/* @flow */

import { genProps, genHandlers, genScopedSlots, genDirectives } from './genData/index'

import { genFor, genIf, genOnce, genSlot, genStatic } from './genElement/index'

import genChildren from './genNode/index'

// import { isReservedTag } from '../optimize/mapping'

// let maybeComponent = () => !isReservedTag(el.tag)

export CodegenResult = {
};
CodegenResult.staticRenderFns = []
CodegenResult.onceId = 0;

export function generate (ast) {
    // const state = new CodegenState(options)
    const code = ast ? genElement(ast) : '_c("div")'

    //render为了生成vnode
    //vnode = render.call(vm._renderProxy, vm.$createElement)

    CodegenResult.render =  `with(this){return ${code}}`

    //code 字符串由vtp生成
    //最终有上面拼接的逻辑  所以code中的真正字符串需要额外“”
    //没有额外“”的都是在运行时或实例对象上的值
    //
}

export function genData (el) {
    
    /*
    <div class="c-atom-aftclk" :tt = "xx|auto" v-show:emm.abcd.efgh="show" @click.native = 'lalalala'>
    {   directives:[{name:"show",
                    rawName:"v-show:emm.abcd.efgh",
                    value:(show),
                    expression:"show",
                    arg:"emm",
                    modifiers:{"abcd":true,"efgh":true}
                }],
        staticClass:"c-atom-aftclk",
        attrs:{"tt":_f("auto")(xx)},
        nativeOn:{"click":function($event){lalalala($event)}}
    }
    */

    let data = '{'

    // directives first.
    // directives may mutate the el's other properties before they are generated.
    const dirs = genDirectives(el)
    if (dirs) data += dirs + ','

    //key/ref 可能是value 可能是字符串
    // key
    if (el.key) {
        data += `key:${el.key},`
    }
    // ref
    if (el.ref) {
        data += `ref:${el.ref},`
    }

    if (el.refInFor) {
        data += `refInFor:true,`
    }
    // pre
    if (el.pre) {
        data += `pre:true,`
    }
    // record original tag name for components using "is" attribute
    if (el.component) {
        //保留原始tag名
        data += `tag:"${el.tag}",`
    }

    // style / class
    // for (let i = 0; i < dataGenFns.length; i++) {
    //     data += dataGenFns[i](el)
    // }
    if (el.staticClass) {
        data += `staticClass:${el.staticClass},`
    }
    if (el.classBinding) {
        data += `class:${el.classBinding},`
    }
    if (el.staticStyle) {
        data += `staticStyle:${el.staticStyle},`
    }
    if (el.styleBinding) {
        data += `style:(${el.styleBinding}),`
    }

    // attributes
    if (el.attrs) {
        data += `attrs:{${genProps(el.attrs)}},`
    }
    // DOM props
    if (el.props) {
        data += `domProps:{${genProps(el.props)}},`
    }

    // event handlers
    if (el.events) {
        data += `${genHandlers(el.events, false)},`
    }
    if (el.nativeEvents) {
        data += `${genHandlers(el.nativeEvents, true)},`
    }
    // slot target
    if (el.slotTarget) {
        data += `slot:${el.slotTarget},`
    }
    // scoped slots
    if (el.scopedSlots) {
        data += `${genScopedSlots(el.scopedSlots)},`
    }

    // component v-model
    if (el.model) {
        data += `model:{value:${
          el.model.value
        },callback:${
          el.model.callback
        },expression:${
          el.model.expression
        }},`
    }
    // inline-template   暂时ban了
    // if (el.inlineTemplate) {
    //     const inlineTemplate = genInlineTemplate(el)
    //     if (inlineTemplate) {
    //       data += `${inlineTemplate},`
    //     }
    // }
    //干掉对象trailing commas
    //在此 data已准备完毕
    data = data.replace(/,$/, '') + '}'


    // genDirectives 把 bind/on 指令的方法解析出来在此调用
    // v-on v-bind 进入不了el.directives
    // 所以el.wrapData 与 el.wrapListeners 不会存在....目前没理解 先注释掉

    // if (el.wrapData) {
    //     data = el.wrapData(data)
    // }
    // if (el.wrapListeners) {
    //     data = el.wrapListeners(data)
    // }
    // 
    return data
}



export function genElement (el) {
    if (el.staticRoot && !el.staticProcessed) {
        return genStatic(el)
    } else if (el.once && !el.onceProcessed) {
        return genOnce(el)
    } else if (el.for && !el.forProcessed) {
        return genFor(el)
    } else if (el.if && !el.ifProcessed) {
        return genIf(el)
    } else if (el.tag === 'template' && !el.slotTarget) {
        return genChildren(el) || 'void 0'
    } else if (el.tag === 'slot') {
        //组件内插槽
        //填充插槽逻辑 slotTarget 在 genData中 
        return genSlot(el)
    } else {
        // component or element
        let code
        // is 特殊属性
        // 标签没有el.component 依然可能是标签
        // 依据tag名
        if (el.component) {
            const children = el.inlineTemplate ? null : genChildren(el, true)
            //componentName genData children返回的都是字符串
            //componentName 是由getBindingAttr 得出的
            //componentName 可能是"componentName" 可能是 '"componentName"'  故动态
            code = return `_c(${componentName},${genData(el)}${
            children ? `,${children}` : ''
            })`
        } else {
            const data = el.plain ? undefined : genData(el)

            const children = el.inlineTemplate ? null : genChildren(el, true)
            //${el.tag} 前后特意加引号
            code = `_c('${el.tag}'${
            data ? `,${data}` : '' // data
            }${
            children ? `,${children}` : '' // children
            })`
        }
        // // module transforms
        // for (let i = 0; i < state.transforms.length; i++) {
        //   code = state.transforms[i](el, code)
        // }
        return code
  }
}
