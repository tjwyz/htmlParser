
// asd =>
// (asd,dsa) =>
// function (
const fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/

//暂时只看前半部分   后面那是啥....
const simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/

// keyCode aliases
// key先ban了....零碎太多了
const keyCodes = {
    esc: 27,
    tab: 9,
    enter: 13,
    space: 32,
    up: 38,
    left: 37,
    right: 39,
    down: 40,
    'delete': [8, 46]
}

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
const genGuard = condition => `if(${condition})return null;`

const modifierCode = {
    stop: '$event.stopPropagation();',
    prevent: '$event.preventDefault();',
    self: genGuard(`$event.target !== $event.currentTarget`),
    ctrl: genGuard(`!$event.ctrlKey`),
    shift: genGuard(`!$event.shiftKey`),
    alt: genGuard(`!$event.altKey`),
    meta: genGuard(`!$event.metaKey`),
    left: genGuard(`'button' in $event && $event.button !== 0`),
    middle: genGuard(`'button' in $event && $event.button !== 1`),
    right: genGuard(`'button' in $event && $event.button !== 2`)
}

export default function genHandlers (events, isNative, warn) {
    let res = isNative ? 'nativeOn:{' : 'on:{'
    for (const name in events) {
        const handler = events[name]
        /*
            @click.native = 'lalalala'
            nativeEvents (events)
                click:{value: "lalalala", modifiers: {…}} 

            nativeOn:{"click":function($event){lalalala($event)}}
         */
        res += `"${name}":${genHandler(name, handler)},`
    }
    return res.slice(0, -1) + '}'
}

function genHandler (name,handler) {
    if (!handler) {
        return 'function(){}'
    }

    if (Array.isArray(handler)) {
        return `[${handler.map(handler => genHandler(name, handler)).join(',')}]`
    }
    //函数名
    const isMethodPath = simplePathRE.test(handler.value)
    //函数直接写上去了
    const isFunctionExpression = fnExpRE.test(handler.value)

    if (!handler.modifiers) {
        return isMethodPath || isFunctionExpression
        ? handler.value
        : `function($event){${handler.value}}` // inline statement
    } else {
        let code = ''
        let genModifierCode = ''
        const keys = []
        for (const key in handler.modifiers) {
            if (modifierCode[key]) {
                genModifierCode += modifierCode[key]
                // left/right
                // if (keyCodes[key]) {
                //     keys.push(key)
                // }
            } else {
                // keys.push(key)
            }
        }
        // if (keys.length) {
        //     code += genKeyFilter(keys)
        // }
        // Make sure modifiers like prevent and stop get executed after key filtering
        if (genModifierCode) {
            code += genModifierCode
        }

        //isMethodPath? lalala($event)
        //:isFunctionExpression? 
        //(function(){//balabala})($event)
        //: this.state = 2
        //
        //
        //function($event){$event.stopPropagation();  lalala($event)}
        //function($event){$event.stopPropagation();  (function(){//balabala})($event)}
        //function($event){$event.stopPropagation();  this.state = 2}

        const handlerCode = isMethodPath
            ? handler.value + '($event)'
            : isFunctionExpression
            ? `(${handler.value})($event)`
            : handler.value
        return `function($event){${code}${handlerCode}}`
    }
}

// function genKeyFilter (keys) {
//     return `if(!('button' in $event)&&${keys.map(genFilterCode).join('&&')})return null;`
// }

// function genFilterCode (key) {
//     const keyVal = parseInt(key, 10)
//     if (keyVal) {
//         return `$event.keyCode!==${keyVal}`
//     }
//     const alias = keyCodes[key]
//     return `_k($event.keyCode,${JSON.stringify(key)}${alias ? ',' + JSON.stringify(alias) : ''})`
// }
