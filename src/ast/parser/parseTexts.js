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
    let rest = text
    while ((match = rest.match(tagRE))) {
        
        // {{}}开始位置
        index = match.index
        // 当前rest第一个 {{ 之前的文案
        if (index > 0) {
            tokens.push(JSON.stringify(rest.slice(0, index)))
        }

        const exp = parseFilters(match[1].trim())
        tokens.push(`_s(${exp})`)

        lastIndex = lastIndex + index + match[0].length
        rest = text.slice(lastIndex)
    }
    //最后一个}}后的文案
    //文案就被stringify 
    if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    //再拼回去
    // 'plain{{this.value}}text' ==>'"plain"_s(this.value)"text"'
    return tokens.join('+')
}
