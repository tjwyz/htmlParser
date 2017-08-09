import parseFilters from './parseFilters'

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/

//文字部分JSON.stringify  binding值部分进入parseFilter
export default function parseText (text,delimiters) {

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
