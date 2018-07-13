const vefunctions = {
	saveCaretPosition (context) {
		var selection = window.getSelection()
		var range = selection.getRangeAt(0)
		range.setStart(context, 0)
		var len = range.toString().length
		return function restore () {
			var pos = vefunctions.getTextNodeAtPosition(context, len)
			selection.removeAllRanges()
			var range = new Range()
			range.setStart(pos.node, pos.position)
			selection.addRange(range)
		}
	},
	getTextNodeAtPosition (root, index) {
		var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, function next (elem) {
			if (index > elem.textContent.length) {
				index -= elem.textContent.length
				return NodeFilter.FILTER_REJECT
			}
			return NodeFilter.FILTER_ACCEPT
		})
		var c = treeWalker.nextNode()
		return {
			node: c || root,
			position: c ? index : 0
		}
	}
}

export default vefunctions
