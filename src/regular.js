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

export{attribute, ncname, qnameCapture, startTagOpen, startTagClose, endTag, doctype, comment, conditionalComment}