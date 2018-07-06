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
				},
				refreshCodemirror: true,
				codemirrorReady: false
			}
		},
		watch: {
			code: function (nVal, oVal) {
				// console.log('changed')
			},
			refreshCodemirror: function (nVal) {
				if (nVal) {
					this.refreshCM()
				}
			}
		},
		mounted () {
			this.code = this.xmlString
		},
		methods: {
			refresh () {
				this.refreshCodemirror = true
			},
			refreshCM () {
				if (this.codemirrorReady) {
					this.$refs.myCm.refresh()
					this.refreshCodemirror = false
				}
			},
			onCmReady (cm) {
				this.codemirrorReady = true
				if (this.refreshCodemirror) {
					this.refreshCM()
				}
			},
			onCmCodeChange (newCode) {
				// console.log('changed')
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
