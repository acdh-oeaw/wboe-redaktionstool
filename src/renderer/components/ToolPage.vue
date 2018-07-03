<template>
	<div class="tool-page">
		<b-tabs v-model="aTab" content-class="tabc">
			<b-tab title="Editor">
				Editor
			</b-tab>
			<b-tab title="Vorschau">
				Vorschau
			</b-tab>
			<b-tab title="Objekt">
				<div class="viewobj scroll p20">
					<ViewObj :xmlObj="xmlObj" v-if="xmlObj"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>xmlObj</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="XML">
				<div class="viewxmleditor scroll p20">
					<ViewXmlEditor :xmlObj="xmlObj" v-if="xmlObj"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>xmlObj</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="XML (Profi)">
				<!-- <div class="viewxmlstring" v-if="xmlString">
					<Monaco width="100%" height="100%" language="xml" theme="vs" :code="xmlString" :changeThrottle="500" :options="monacoOptions" @mounted="monacoOnMounted" @codeChange="monacoOnCodeChange" srcPath="/xxx/"></Monaco>
				</div>
				<div class="alert alert-danger" role="alert" v-else>Kein <b>xmlString</b> vorhanden!</div> -->
			</b-tab>
		</b-tabs>
	</div>
</template>

<script>
	import ViewObj from './ToolPage/ViewObj'
	import ViewXmlEditor from './ToolPage/ViewXmlEditor'
	// import Monaco from 'monaco-editor-forvue'
	import FunctionsTool from './ToolPage/functions.js'
	import test from './ToolPage/testData.js'

	export default {
		name: 'tool-page',
		data () {
			return {
				aTab: 2,
				objParser: undefined,
				xmlOrgString: undefined,
				xmlString: undefined,
				xmlStringError: undefined,
				monacoOptions: { wrappingIndent: 'indent', autoIndent: true, showFoldingControls: 'always', minimap: {enabled: true, showSlider: 'always'} },
				// monacoEditor: undefined,
				xmlDom: undefined,
				xmlObj: undefined
			}
		},
		watch: {
			aTab: function (nVal) {
				// if (nVal === 4 && this.monacoEditor) {
				// 	this.$nextTick(() => { this.monacoEditor.layout() })
				// }
			},
			xmlDom: function (nVal) {
				if (nVal) {
					this.xmlObj = {c: this.objParserUpdate(this.xmlDom2Obj(nVal), this.objParser), t: 'start'}
				} else {
					this.xmlObj = undefined
				}
			},
			xmlString: function (nVal, oVal) {
				// if (nVal !== oVal && this.monacoEditor) {
				// 	this.monacoEditor.setValue(nVal)
				// }
			}
		},
		mounted: function () {
			this.objParser = this.xmlDom2Obj(this.xmlString2xmlDom(test.testOptionObj).xmlDom, true)
			this.xmlOrgString = test.testXML
			this.xmlDom = this.xmlString2xmlDom(this.xmlOrgString).xmlDom
			this.$nextTick(() => {
				this.xmlString = this.obj2xmlString(this.xmlObj)
				this.xmlDom = this.xmlString2xmlDom(this.xmlString).xmlDom
			})
		},
		methods: {
			obj2xmlString: FunctionsTool.obj2xmlString,
			xmlString2xmlDom: FunctionsTool.xmlString2xmlDom,
			xmlDomCheck: FunctionsTool.xmlDomCheck,
			xmlDom2Obj: FunctionsTool.xmlDom2Obj,
			objParserUpdate: FunctionsTool.objParserUpdate,
			// monacoOnMounted: function (editor) {
			// 	this.monacoEditor = editor
			// },
			// monacoOnCodeChange: function () {
			// 	// console.log(this.monacoEditor.getValue())
			// }
		},
		components: {
			ViewObj,
			ViewXmlEditor,
			// Monaco
		}
	}
</script>

<style>
	.tool-page {
		margin-top: 40px;
	}
	.tabc {
		border: 1px solid #eee;
		border-top: none;
		min-height: 76vh;
	}
	.tabc > div > .scroll {
		max-height: 76vh;
	}
	.viewxmlstring {
		overflow: hidden;
		height: 76vh;
	}
</style>
