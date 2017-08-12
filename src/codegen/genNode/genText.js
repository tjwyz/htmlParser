export default function genText (text) {
	// 'plain{{this.value}}text' ==>'"plain"_s(this.value)"text"'
    return `_v(${text.expression})`
}
