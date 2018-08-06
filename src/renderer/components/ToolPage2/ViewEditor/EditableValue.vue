<template>
	<span class="val-obj" v-if="editType === 'selectPossibleValues'">
		<SelectPossibleValues @select="setSelected" :selected="getSelected()" :selectedText="this.content.orgXmlObj.getValue(false)" :values="content.parserObj.options.get('value.is.possibleValues')"/>
	</span>

	<span class="val-obj val-txt" v-else>
		<span class="val-edit val-focus" ref="valEdit" @input="valEditUpdate" @blur="valEditUpdateValue" @keyup.enter="" contenteditable>{{ content.orgXmlObj.getValueByOption(content.parserObj.options.get('value'), false) }}</span>
		<font-awesome-icon @click="$refs.valEdit.focus()" icon="edit" class="fa-icon" :title="editType"/>
	</span>
</template>

<script>
	import SelectPossibleValues from './SelectPossibleValues'
	export default {
		name: 'EditableValue',
		props: {
			content: Object
		},
		data () {
			return {
				'isOpen': true,
			}
		},
		computed: {
			editType () {		// Art der Wert bearbeitung
				if (this.content.parserObj.options.get('value.is.possibleValues')) {
					return 'selectPossibleValues'
				}
				return 'text'
			}
		},
		methods: {
			getSelected: function () {
				let sVal = this.content.orgXmlObj.getValue(false)
				let oKey = -1
				this.content.parserObj.options.get('value.is.possibleValues').some(function (aVal, aKey) {
					if ((aVal.title || aVal.value || aVal) === sVal) {
						oKey = aKey
						return true
					}
				}, this)
				return oKey
			},
			setSelected: function (val) {
				console.log('setSelected', val)
			},
			valEditUpdate: function (e) {
				var restoreCaretPosition = saveCaretPosition(e.target)
				e.target.innerText = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '')
				restoreCaretPosition()
			},
			valEditUpdateValue: function (e) {
				console.log('valEditUpdateValue', e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, ''))
			},
		},
		components: {
			SelectPossibleValues
		},
	}

	function saveCaretPosition (context) {
		var selection = window.getSelection()
		var range = selection.getRangeAt(0)
		range.setStart(context, 0)
		var len = range.toString().length
		return function restore () {
			var pos = getTextNodeAtPosition(context, len)
			selection.removeAllRanges()
			var range = new Range()
			range.setStart(pos.node, pos.position)
			selection.addRange(range)
		}
	}
	function getTextNodeAtPosition (root, index) {
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
</script>

<style scoped>
	.val-txt {
		padding: 0px 3px;
		padding-bottom: 3px;
    border-radius: 2px;
	}
	.val-txt:hover {
		background: #eef;
	}
	.val-edit {
		display: inline-block;
		min-width:5px;
		padding: 0px 2px;
		cursor: text;
	}
</style>
