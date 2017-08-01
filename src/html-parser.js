/**
 * 特殊字符：^ $ . * +  - ? = ! : | \ / ( ) [ ] { }
 * \ (反斜杠)
 * 1.在非特殊字符前加反斜杠表示下一个字符是特殊的；
 * \d：匹配一个数字，等价于[0-9]；
 * \D：匹配一个非数字字符，等价于[^0-9]；
 * \f：匹配一个换页符 (U+000C)；
 * \n：匹配一个换行符 (U+000A)；
 * \r：匹配一个回车符 (U+000D)；
 * \s：匹配一个空白字符，包括空格、制表符、换页符和换行符，等价于[ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]；
 * \S：匹配一个非空白字符，等价于[^ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]；
 * \w：匹配一个单字字符（字母、数字或者下划线），等价于[A-Za-z0-9_]；
 * \W：匹配一个非单字字符，等价于[^A-Za-z0-9_]
 * 
 * 2.将其后的特殊字符转译为字面量；
 * 
 * 3.在使用RegExp构造函数时要将\转译，因为\在字符串里也是转译字符
 */

/**
 * g：全局搜索；
 * i：不区分大小写；
 * m：多行搜索；
 */

/**
 * ^ 
 * 1.匹配输入的开始；
 * 2.在[]中的第一位时表示反向字符集；
 * [xyz]：一个字符集合。匹配方括号的中任意字符;
 * [^xyz]：一个反向字符集。匹配任何没有包含在方括号中的字符；
 * 
 * $ 
 * 匹配输入的结束
 */

/**
 * .
 * 匹配除换行符之外的任何单个字符
 * *
 * 匹配前一个表达式0次或多次。等价于 {0,}；
 * +
 * 匹配前面一个表达式1次或者多次。等价于 {1,}；
 * ?
 * 1.匹配前面一个表达式0次或者1次。等价于 {0,1}；
 * 2.如果紧跟在任何量词 * + ? {} 的后面，将会使量词变为非贪婪的（匹配尽量少的字符），和缺省使用的贪婪模式正好相反；
 * /\d+/.exec('123abc')       // ["123", index: 0, input: "123abc"]
 * /\d+?/.exec('123abc')      // ["1", index: 0, input: "123abc"]
 * 3.运用于先行断言非捕获
 * (x) 匹配 'x' 并且记住匹配项，括号表示捕获括号
 * (?:x)  匹配 'x' 但是不记住匹配项，这种叫作非捕获括号
 *
 * regExp.test 匹配的结果为true或false
 * string.match 匹配的结果含有捕获项
 */


 //https://html.spec.whatwg.org/multipage/syntax.html#


//属性前可以有任意多空格
//属性名为 非 空"'=<>/\ 的单字符一个或多个
//属性值可不存在 但有= 就必须有属性值
//属性值不与字符串包裹符一致即可,也可以无字符串包裹符(无包裹时值不能有歧义)
//"a=b".match(attribute)
//key[0] match值 
//key[1] -- key[5] 五个括号对应的捕获值   无则undefined
//1:name 2:= 3-5:双引号、单引号、没有引号 时的value
//key[x] match start index 
//key[x+1] input
const attribute = /^\s*([^\s"'=<>\/\\]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

//标签名不能以数字开头...
// '\\'  -- 在使用RegExp构造函数时要将\转译
const ncname = '[a-zA-Z_][\\w\\-\\.]*'

//标签名可能会出现svg:path这种情况....捕获path
const qnameCapture = `((?:${ncname}\\:)?${ncname})`

// <div
// new RegExp('[a-zA-Z_][\\w\\-\\.]*')  == /[a-zA-Z_][\w\-\.]*/
const startTagOpen = new RegExp(`^<${qnameCapture}`)

//正常就一个> 但可能有img这种单标签  需要/>
//单标签特殊捕获出来

const startTagClose = /^\s*(\/?)>/
// </div>
const endTag = new RegExp(`^<\\/${qnameCapture}>`)

//<!DOCTYPE html> DOCTYPE与后续内容有空格分割且不区分大小写
const doctype = /^<!DOCTYPE [^>]+>/i

const comment = /^<!\--/
//匹配xml里的<![CDATA 或者<![if !IE]>
//标注出来暂时先忽略吧....
const conditionalComment = /^<!\[/


// Special Elements (can contain anything)
export const isPlainTextElement = makeMap('script,style,textarea', true)

const reCache = {}

const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t'
}
const encodedAttr = /&(?:lt|gt|quot|amp);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true)
const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n'

function decodeAttr (value, shouldDecodeNewlines) {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
  return value.replace(re, match => decodingMap[match])
}

export class Parser{
    constructor(html){
        this.stack = [];
        this.html = html;
        this.raw = html;
        this.index = 0;
        this.last = undefined;
        this.lastTag = undefined;
    }
    advance(n){
        this.index += n
        this.html = this.html.substring(n)
    }
    parseStartTag (html) {
        let html = html || this.html
        let willAdvance = 0
        //eg:<div id='a'></div>
        const start = html.match(startTagOpen)
        const match = {
            tagName: start[1],
            attrs: [],
            start: this.index,
            unarySlash:false
        }

        //consume <div
        //now: id='a'></div>
        willAdvance += start[0].length

        //consume  id='a'
        //now:>
        let end, attr
        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            willAdvance += attr[0].length
            match.attrs.push(attr)
        }

        //starTag闭合了 才是一个真的tag 负责只是段文案
        if (end) {
            //unary 一元的  Slash 斜线
            //eg:<img/>
            match.unarySlash = !!end[1]
            willAdvance += end[0].length
            match.willAdvance = willAdvance
            match.end = this.index + willAdvance
            return match
        } else {
            return undefined
            //当做无事发生...
            //
            // <div id='as' 
            // 这可以是一段文案...
        }
    }

    /**
     * tagName: str,
     * attrs: [],
     * start: number,
     * end:number,
     * unarySlash:boolean,
     * willAdvance:number
     */

    handleStartTag (match) {
        const tagName = match.tagName
        const unarySlash = match.unarySlash

        /**
         * 两种 popstack && 将新值pushstack 的可能
         */
        //严格嵌套约束规则：
        // a元素里不可以嵌套交互式元素(<a>、<button>、<select>等)
        // <p>里面不可以嵌套<div>、<h1>~<h6>、<p>、<ul>/<ol>/<li>、<dl>/<dt>/<dd>、<form>等
        if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
            parseEndTag(lastTag)
        }

        //optional-tags
        //https://html.spec.whatwg.org/multipage/syntax.html#optional-tags
        if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
            parseEndTag(lastTag)
        }

        //当前标签一元
        //一元标签内不可能有文案,所以不进行pushstack,自然也没有了容纳文案的机会
        //一元标签不一定<unary/>也可能<unary>
        //
        //<div/> 也会认为是个一元标签..对应一个没有plaintext的div
        const unary = isUnaryTag(tagName) || unarySlash

        const l = match.attrs.length
        const attrs = new Array(l)
        for (let i = 0; i < l; i++) {
            const value = args[3] || args[4] || args[5] || ''
            attrs[i] = {
                name: args[1],
                value: value
            }
        }

        if (!unary) {
            this.stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs })
            lastTag = tagName
        }

        //ast interface
        // if (options.start) {
        //     options.start(tagName, attrs, unary, match.start, match.end)
        // }
    }

    parseEndTag (tagName, start, end) {
        let pos, lowerCasedTagName
        if (start == null) start = index
        if (end == null) end = index

        if (tagName) {
            lowerCasedTagName = tagName.toLowerCase()
        }

        // Find the closest opened tag of the same type
        if (tagName) {
            for (pos = stack.length - 1; pos >= 0; pos--) {
                if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                    break
                }
            }
        } else {
            // If no tag name is provided, clean shop
            unexpected()
        }

        if (pos >= 0) {
            // Close all the open elements, up the stack
            for (let i = stack.length - 1; i >= pos; i--) {
                //警告这些没闭合的自动被闭合了
                warn(
                `tag <${stack[i].tag}> has no matching end tag.`
                )
                //<div><p><a></div>
                //pop stack by order
                // if (options.end) {
                //     //为什么要给ast接口暴露 start end?
                //     options.end(stack[i].tag, start, end)
                // }
            }

            // Remove the open elements from the stack
            stack.length = pos
            lastTag = pos && stack[pos - 1].tag
        }
    }

    parse(){
        while(this.html){
            //indexOf() 方法可返回某个指定的字符串值在字符串中首次出现的位置
            let textEnd = this.html.indexOf('<')

            //标签处理逻辑
            //和 文案处理逻辑 平级
            //但是textEnd === 0 不一定代表当前就是标签
            if (textEnd === 0) {
                // Comment:
                if (comment.test(this.html)) {
                    const commentEnd = html.indexOf('-->')
                    advance(commentEnd + 3)
                    continue
                }

                // Doctype:
                const doctypeMatch = this.html.match(doctype)
                if (doctypeMatch) {
                    advance(doctypeMatch[0].length)
                    continue
                }

                // Start tag:
                // html.match(startTagOpen) 不一定是tag
                // eg:  <div id='as'   一段文案...

                // const startTagMatch = html.match(startTagOpen)
                const startTagMatch = this.parseStartTag()
                if (startTagMatch) {

                    //<div id='a'> or <img id='a' /> has been consumed after parseStartTag()
                    this.advance(startTagMatch.willAdvance)

                    this.handleStartTag(startTagMatch)

                    if (shouldIgnoreFirstNewline(lastTag, html)) {
                        advance(1)
                    }
                    continue
                }

                // End tag:
                const endTagMatch = html.match(endTag)
                if (endTagMatch) {
                    const curIndex = index
                    advance(endTagMatch[0].length)
                    parseEndTag(endTagMatch[1], curIndex, index)
                    continue
                }
            }

            //文案处理逻辑
            //收集距离下个标签的文案
            let text, rest, next
            if (textEnd >= 0) {

                rest = html.slice(textEnd)
                //在此只收集非标签内容
                //收集完毕后获取plaintext并advance,继续循环,标签交给上方逻辑处理
                while (
                !endTag.test(rest) &&
                !this.parseStartTag(rest) &&
                !comment.test(rest)
                ) {
                    // < in plain text, be forgiving and treat it as text
                    next = rest.indexOf('<', 1)
                    if (next < 0) break
                    textEnd += next
                    rest = html.slice(textEnd)
                }
                text = html.substring(0, textEnd)
                advance(textEnd)
            }
            //剩下的全是文案了.
            if (textEnd < 0) {
                text = html
                html = ''
            }

            //callback chars interface
            // if (options.chars && text) {
            //     options.chars(text)
            // }
        }

    }
}