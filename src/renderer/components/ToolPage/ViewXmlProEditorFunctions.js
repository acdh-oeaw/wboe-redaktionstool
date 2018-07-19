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
	cmOptions: {		// Optinen für Codemirror
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
	refresh () {
		this.refreshCodemirror = true
	},
	refreshCodemirror: function (nVal) {
		if (nVal) {
			this.refreshCM()
		}
	},
	refreshCM () {		// Codemirror neu zeichnen
		if (this.codemirrorReady) {
			this.$refs.myCm.refresh()
			this.refreshCodemirror = false
		}
	},
	onCmReady (cm) {		// Codemirror bereit
		this.codemirrorReady = true
		if (this.refreshCodemirror) {
			this.refreshCM()
		}
		this.$nextTick(() => {
			this.markErrors()
		})
	},
}
