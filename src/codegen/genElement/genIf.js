import { genElement } from '../index'
import genOnce from './genOnce'

export default function genIf (el) {
    el.ifProcessed = true // avoid recursion
    //特意slice一下 深拷贝   后续生成渲染函数字符串不影响ast中的ifConditions
    return genIfConditions(el.ifConditions.slice())
}

function genIfConditions (conditions) {
    if (!conditions.length) {
        return '_e()'
    }
    //栈首元素
    const condition = conditions.shift()


    //a
    //?genTernaryExp(ablock)
    //:b
    //?genTernaryExp(bblock)
    //:genTernaryExp(cblock)
    
    //上下两个函数都执行  返回一段字符串
    if (condition.exp) {
        return `(${condition.exp})?${
        genTernaryExp(condition.block)
        }:${
        //递归
        genIfConditions(conditions)
        }`
    } else {
        return `${genTernaryExp(condition.block)}`
    }

    // v-if with v-once should generate code like (a)?_m(0):_m(1)
    function genTernaryExp (el) {
        return  el.once
        ? genOnce(el)
        : genElement(el)
    }
}
