// type == 3 切iscomment == true
export default function genComment (comment) {
    return `_e('${comment.text}')`
}