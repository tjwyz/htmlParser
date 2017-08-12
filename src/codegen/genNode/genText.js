export default function genText (text) {
    return `_v(${text.type === 2
        ? text.expression 
        // no need for () because already wrapped in _s()
        // ""sss"+_s(Now you see me)+"ddddd"+_s(xxxxx)+"1111\n2""
        // "_s(Now you don't)"
        
        // type == 3 切iscomment == false
        JSON.stringify(text.text)

    })`
}
