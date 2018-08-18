<template>
	<div class="h100">
		<div id="editor" class="h100" autofocus></div>
	</div>
</template>

<script>
	import _ from 'lodash'
	import { mapState } from 'vuex'

	export default {
		name: 'ViewXML',
		props: {
			xmlString: String,
			orgXmlString: String,
		},
		data () {
			return {
				content: '',
				orgContent: '',
				selection: {},
				monaco: {},
				editor: {},
				editorModel: null,
				orgModel: null,
				alertDiff: true,
				changed: false,
				ready: false,
			}
		},
		computed: {
			...mapState(['Options']),
		},
		watch: {
			'Options.show.monacoDiff' (nVal, oVal) {
				if (this.alertDiff && this.changed) {
					alert('Ansicht kann nur nach dem Anwenden der Änderungen geändert werden!')
					this.$nextTick(() => {
						this.$store.dispatch('TOGGLE_SHOW', 'monacoDiff')
						this.alertDiff = false
					})
				} else {
					console.log('refresh')
					this.alertDiff = true
					this.$emit('refresh')
				}
			},
			'content' (nVal) {
				if (this.ready) {
					this.updateContent()
					this.changed = true
				}
			},
		},
		mounted () {
			this.content = this.xmlString
			this.orgContent = this.orgXmlString
			loadMonacoEditor(this)
		},
		methods: {
			updateContent: _.debounce(function () {
				this.$emit('changed', this.content)
			}, 250),
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
		self.module = null
		self.process.browser = true
		amdRequire(['vs/editor/editor.main'], function () {
			thisEditor.monaco = this.monaco
			thisEditor.monaco.languages.html.htmlDefaults.options.format.tabSize = 2
			const editorContainer = document.getElementById('editor')
			const editorOptions = {
				language: 'xml',
				autoIndent: true,
				wrappingIndent: 'same',
				showFoldingControls: 'always',
				multiCursorModifier: 'ctrlCmd',
				tabSize: 2
			}
			if (thisEditor.Options.show.monacoDiff) {
				thisEditor.editor = this.monaco.editor.createDiffEditor(editorContainer, editorOptions)
			} else {
				thisEditor.editor = this.monaco.editor.create(editorContainer, editorOptions)
			}
			function updateDimensions () {
				thisEditor.editor.layout()
			}
			window.addEventListener('resize', updateDimensions)
			editorContainer.addEventListener('resize', updateDimensions)
			thisEditor.editorModel = this.monaco.editor.createModel(thisEditor.content, 'xml')
			thisEditor.editorModel.onDidChangeContent(e => {
				thisEditor.content = thisEditor.editorModel.getValue()
			})
			if (thisEditor.Options.show.monacoDiff) {
				thisEditor.orgModel = this.monaco.editor.createModel(thisEditor.orgContent, 'xml')
				thisEditor.editor.setModel({'original': thisEditor.orgModel, 'modified': thisEditor.editorModel})
			} else {
				thisEditor.editor.setModel(thisEditor.editorModel)
				thisEditor.editor.onDidChangeCursorSelection(e => {
					thisEditor.selection = e.selection
				})
			}
		})
		thisEditor.$nextTick(() => {
			thisEditor.ready = true
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
