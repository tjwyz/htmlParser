export default function genProps (props) {
    let res = ''
    for (let i = 0; i < props.length; i++) {
        const prop = props[i]
        // res += `"${prop.name}":${transformSpecialNewlines(prop.value)},`
        // name 一定需要"" 不然会被当做值来解释  value则不一定  在ast截断已经确定好了
        res += `"${prop.name}":${prop.value},`
    }
    //remove trailing comma
    return res.slice(0, -1)
}