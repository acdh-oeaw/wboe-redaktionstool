<template>
	<codemirror ref="myCm"
							:value="code"
							:options="cmOptions"
							@ready="onCmReady"
							@input="onCmCodeChange"></codemirror>
</template>

<script>
	import 'codemirror/mode/javascript/javascript.js'
	import 'codemirror/mode/gfm/gfm.js'
	import 'codemirror/mode/markdown/markdown.js'
	import 'codemirror/mode/xml/xml.js'
	import 'codemirror/addon/edit/closetag.js'
	import 'codemirror/addon/edit/continuelist.js'
	import 'codemirror/addon/edit/closebrackets.js'
	import 'codemirror/addon/lint/lint.js'
	import 'codemirror/addon/mode/overlay.js'
	import 'codemirror/addon/fold/foldcode.js'
	import 'codemirror/addon/fold/foldgutter.js'
	import 'codemirror/addon/fold/brace-fold.js'
	import 'codemirror/addon/fold/xml-fold.js'
	import 'codemirror/addon/fold/markdown-fold.js'
	import 'codemirror/addon/fold/comment-fold.js'
	import 'codemirror/addon/selection/active-line.js'

	export default {
		name: 'ViewXmlProEditor',
		props: {
			xmlString: String
		},
		data () {
			return {
				code: '',
				cmOptions: {
					mode: 'text/html',
					theme: 'default',
					autoCloseTags: true,
					showCursorWhenSelecting: true,
					lineNumbers: true,
					lineWrapping: true,
					tabSize: 4,
					foldGutter: true,
					electricChars: true,
					styleActiveLine: true,
					matchBrackets: true,
					dragDrop: false,
					autoCloseBrackets: true,
					autoRefresh: true,
					styleSelectedText: true,
					line: true,
					indentWithTabs: true,
					gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
				}
			}
		},
		mounted () {
			this.code = this.xmlString
		},
		methods: {
			onCmReady (cm) {
				console.log('the editor is readied!', cm)
			},
			onCmCodeChange (newCode) {
				// console.log('this is new code', newCode)
				this.code = newCode
			}
		}
	}
</script>

<style>
	.vue-codemirror {
		height: 100%;
	}
	.CodeMirror {
		height: 100%;
	}
</style>
