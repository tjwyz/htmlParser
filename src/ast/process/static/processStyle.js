import { getAndRemoveAttr,getBindingAttr } from '../../modifier'

//正常写style 变成对象json.stringify
function parseStyleText (cssText) {
  const res = {}
  //;
  const listDelimiter = /;(?![^(]*\))/g
  //:
  const propertyDelimiter = /:(.+)/
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter)
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim())
    }
  })
  return res
}
export default function processStyle (el) {
    const staticStyle = getAndRemoveAttr(el, 'style')
    if (staticStyle) {
        //warn
        //'instead of <div style="{{ val }}">, use <div :style="val">.'

        // "position:absolute;z-index:1" to "{"position":"absolute","z-index":"1"}"
        el.staticStyle = JSON.stringify(parseStyleText(staticStyle))
    }

    const styleBinding = getBindingAttr(el, 'style')
    if (styleBinding) {
        el.styleBinding = styleBinding
    }
}