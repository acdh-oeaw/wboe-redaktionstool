<template>
	<div class="h100">
		<div id="editor" class="h100" autofocus></div>
	</div>
</template>

<script>
	export default {
		name: 'ViewXML',
		props: {
			xmlString: String,
		},
		data () {
			return {
				content: '',
				selection: {},
				monaco: {},
				editor: {},
				editorModel: null
			}
		},
		computed: {
		},
		mounted: function () {
			this.content = this.xmlString
			loadMonacoEditor(this)
		},
	}

	function requireMonacoEditor (amdRequire, thisEditor) {
		var path = require('path')
		function uriFromPath (_path) {
			var pathName = path.resolve(_path).replace(/\\/g, '/')
			if (pathName.length > 0 && pathName.charAt(0) !== '/') {
				pathName = '/' + pathName
			}
			return encodeURI('file://' + pathName)
		}
		amdRequire.config({
			baseUrl: uriFromPath(path.join(__dirname, ((process.env.NODE_ENV === 'development') ? '../../' : '') + '../../node_modules/monaco-editor/dev'))
		})
		// workaround monaco-css not understanding the environment
		self.module = null
		// workaround monaco-typescript not understanding the environment
		self.process.browser = true
		amdRequire(['vs/editor/editor.main'], function () {
			thisEditor.monaco = this.monaco
			thisEditor.monaco.languages.html.htmlDefaults.options.format.tabSize = 2
			const editorContainer = document.getElementById('editor')
			thisEditor.editor = this.monaco.editor.create(editorContainer, {
				language: 'xml',
				autoIndent: true,
				wrappingIndent: 'same',
				showFoldingControls: 'always',
				multiCursorModifier: 'ctrlCmd',
				tabSize: 2
			})
			function updateDimensions () {
				thisEditor.editor.layout()
			}
			window.addEventListener('resize', updateDimensions)
			editorContainer.addEventListener('resize', updateDimensions)
			thisEditor.editorModel = this.monaco.editor.createModel(thisEditor.content, 'xml')
			thisEditor.editorModel.onDidChangeContent(e => {
				thisEditor.content = thisEditor.editorModel.getValue()
			})
			thisEditor.editor.onDidChangeCursorSelection(e => {
				thisEditor.selection = e.selection
			})
			thisEditor.editor.setModel(thisEditor.editorModel)
		})
	}
	function loadMonacoEditor (thisEditor) {
		if (!thisEditor.$store.state.AmdRequire.amdRequire.config) {
			const nodeRequire = global.require
			const loaderScript = document.createElement('script')
			loaderScript.onload = () => {
				const amdRequire = global.require
				thisEditor.$store.commit('SET_AMD_REQUIRE', amdRequire)
				global.require = nodeRequire
				requireMonacoEditor(amdRequire, thisEditor)
			}
			loaderScript.setAttribute('src', '../../node_modules/monaco-editor/dev/vs/loader.js')
			document.body.appendChild(loaderScript)
		} else {
			requireMonacoEditor(thisEditor.$store.state.AmdRequire.amdRequire, thisEditor)
		}
	}
</script>

<style scoped>
</style>
