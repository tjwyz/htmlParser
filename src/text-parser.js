import { parseFilters } from './filter-parser'
//{{text}}
// .|\n 所有字符无脑匹配
//?如果紧跟在任何量词 * + ? {} 的后面，将会使量词变为非贪婪的
//
//
//
//文字部分JSON.stringify  binding值部分进入parseFilter
const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/


export function parseText (text,delimiters) {

    //plain{{this.value}}text

    // const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
    // 暂时先不支持自定义分隔符
    const tagRE = defaultTagRE
    if (!text.match(tagRE)) {
        return
    }

    const tokens = []
    let lastIndex = 0

    let match, index
    while ((match = text.match(tagRE))) {
        //开始位置
        index = match.index
        // push text token
        if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        // tag token
        //  {{ message.split('').reverse().join('') }}
        const exp = parseFilters(match[1].trim())
        tokens.push(`_s(${exp})`)
        lastIndex = index + match[0].length
    }
    if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    //再拼回去
    //plain{{this.value}}text ==>plain_s(this.value)text
    return tokens.join('+')
}
