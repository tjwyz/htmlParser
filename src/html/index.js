import {attribute, ncname, qnameCapture, startTagOpen, startTagClose, endTag, doctype, comment, conditionalComment} from './regular';
import {isUnaryTag, canBeLeftOpenTag, isNonPhrasingTag} from './mapping';
export default class Parser{
    constructor(options){
        this.htmlStack = [];
        this.index = 0;
        this.lastTag = undefined;
    }
    advance(n){
        this.index += n
        this.html = this.html.substring(n)
    }
    parseStartTag (html) {
        
        html = html || this.html
        let willAdvance = 0
        //eg:<div id='a'></div>
        const start = html.match(startTagOpen)
        if (!start){
            return false
        }
        const match = {
            tagName: start[1],
            attrs: [],
            start: this.index,
            unarySlash:false
        }

        //consume <div
        //now: id='a'></div>
        willAdvance += start[0].length
        html = html.substring(start[0].length)

        //consume  id='a'
        //now:>
        let end, attr
        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            willAdvance += attr[0].length
            html = html.substring(attr[0].length)
            match.attrs.push(attr)
        }

        //starTag闭合了 才是一个真的tag 负责只是段文案
        if (end) {
            willAdvance += end[0].length
            html = html.substring(end[0].length)

            match.unarySlash = !!end[1]
            match.willAdvance = willAdvance
            match.end = this.index + willAdvance
            return match
        } else {
            return false
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
        if (this.lastTag === 'p' && isNonPhrasingTag(tagName)) {
            this.handleEndTag(this.lastTag)
        }

        //optional-tags
        //https://html.spec.whatwg.org/multipage/syntax.html#optional-tags
        if (this.lastTag === tagName && canBeLeftOpenTag(tagName) ) {
            this.handleEndTag(this.lastTag)
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
            const value = match.attrs[i][3] || match.attrs[i][4] || match.attrs[i][5] || ''
            attrs[i] = {
                name: match.attrs[i][1],
                value: value
            }
        }

        if (!unary) {
            this.htmlStack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs })
            this.lastTag = tagName
        }

        // ast interface
        if (this.tagPush) {
            this.tagPush(tagName, attrs, unary, match.start, match.end)
        }
    }

    handleEndTag (tagName, start, end) {
        let pos, lowerCasedTagName
        if (start == null) start = index
        if (end == null) end = index

        if (tagName) {
            lowerCasedTagName = tagName.toLowerCase()
        }

        // Find the closest opened tag of the same type
        if (tagName) {
            for (pos = this.htmlStack.length - 1; pos >= 0; pos--) {
                if (this.htmlStack[pos].lowerCasedTag === lowerCasedTagName) {
                    break
                }
            }
        } else {
            // If no tag name is provided, clean shop
            unexpected()
        }

        if (pos >= 0) {
            // Close all the open elements, up the stack
            for (let i = this.htmlStack.length - 1; i >= pos; i--) {
                //警告这些没闭合的自动被闭合了
                // warn(
                // `tag <${stack[i].tag}> has no matching end tag.`
                // )
                //<div><p><a></div>
                //pop stack by order
                if (this.tagPop) {
                    this.tagPop(this.htmlStack[i].tag, start, end)
                }
            }

            // Remove the open elements from the stack
            this.htmlStack.length = pos
            this.lastTag = pos && this.htmlStack[pos - 1].tag
        }
    }

    parse(html){
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
                    this.advance(commentEnd + 3)
                    continue
                }

                // Doctype:
                const doctypeMatch = this.html.match(doctype)
                if (doctypeMatch) {
                    this.advance(doctypeMatch[0].length)
                    continue
                }

                // Start tag:
                // html.match(startTagOpen) 不一定是tag
                // eg:  <div id='as'   一段文案...//在此只收集非

                // const startTagMatch = html.match(startTagOpen)
                const startTagMatch = this.parseStartTag()
                if (startTagMatch) {

                    //<div id='a'> or <img id='a' /> has been consumed after parseStartTag()
                    this.advance(startTagMatch.willAdvance)

                    this.handleStartTag(startTagMatch)

                    continue
                }

                // End tag:
                const endTagMatch = this.html.match(endTag)
                if (endTagMatch) {
                    const curIndex = this.index
                    this.advance(endTagMatch[0].length)
                    this.handleEndTag(endTagMatch[1], curIndex, this.index)
                    continue
                }
            }

            //文案处理逻辑
            //收集距离下个标签的文案
            let text, rest, next
            if (textEnd >= 0) {

                rest = this.html.slice(textEnd)
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
                    rest = this.html.slice(textEnd)
                }
                text = this.html.substring(0, textEnd)
                this.advance(textEnd)
            }
            //剩下的全是文案了.
            if (textEnd < 0) {
                text = html
                html = ''
            }

            //callback chars interface
            if (this.chars && text) {
                this.chars(text)
            }
        }
    }
    
}