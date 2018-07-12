<template>
	<div class="tool-page">
		<b-button-toolbar class="main-toolbar">
			<b-button-group size="sm" class="mr-1 mil-auto">
				<b-btn :title="xmlObjError" :variant="((Array.isArray(xmlObjErrors) && xmlObjErrors.length > 0) ? 'danger' : 'success')"  v-b-tooltip.hover.html :disabled="ViewXmlProEditorChanged"><font-awesome-icon :icon="((xmlObjErrors && xmlObjErrors.length > 0) ? 'exclamation-triangle' : 'clipboard-check')"/></b-btn>
			</b-button-group>
		</b-button-toolbar>
		<b-tabs v-model="aTab" content-class="tabc">
			<b-tab title="Editor" :disabled="ViewXmlProEditorChanged">
				<b-button-toolbar class="toolbar">
					<b-button-group size="sm" class="mr-1 mil-auto">
						<b-btn disabled><font-awesome-icon icon="eye"/></b-btn>
						<b-btn :pressed.sync="viewEditorShowComment"><font-awesome-layers><font-awesome-icon icon="comment"/><font-awesome-icon :icon="((viewEditorShowComment) ? 'check' : 'times')" transform="shrink-6" class="fal-br"/></font-awesome-layers></b-btn>
						<b-btn :pressed.sync="viewEditorShowAdd"><font-awesome-layers><font-awesome-icon icon="plus"/><font-awesome-icon :icon="((viewEditorShowAdd) ? 'check' : 'times')" transform="shrink-6" class="fal-br"/></font-awesome-layers></b-btn>
					</b-button-group>
				</b-button-toolbar>
				<div class="viewobj scroll wtool p20">
					<ViewEditor :xmlObj="xmlObj" :showComment="viewEditorShowComment" :showAdd="viewEditorShowAdd" v-if="xmlObj"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>xmlObj</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="Vorschau" :disabled="ViewXmlProEditorChanged">
				Vorschau
			</b-tab>
			<b-tab title="Objekt" :disabled="ViewXmlProEditorChanged">
				<b-button-toolbar class="toolbar">
					<b-button-group size="sm" class="mr-1 mil-auto">
						<b-btn disabled><font-awesome-icon icon="eye"/></b-btn>
						<b-btn :pressed.sync="viewObjShowComment"><font-awesome-layers><font-awesome-icon icon="comment"/><font-awesome-icon :icon="((viewObjShowComment) ? 'check' : 'times')" transform="shrink-6" class="fal-br"/></font-awesome-layers></b-btn>
						<b-btn :pressed.sync="viewObjShowAdd"><font-awesome-layers><font-awesome-icon icon="plus"/><font-awesome-icon :icon="((viewObjShowAdd) ? 'check' : 'times')" transform="shrink-6" class="fal-br"/></font-awesome-layers></b-btn>
					</b-button-group>
				</b-button-toolbar>
				<div class="viewobj scroll wtool p20">
					<ViewObj :xmlObj="xmlObj" :showComment="viewObjShowComment" :showAdd="viewObjShowAdd" v-if="xmlObj"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>xmlObj</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="XML">
				<b-button-toolbar class="toolbar">
					<b-button-group size="sm" class="mr-1 mil-auto">
						<b-btn @click="ViewXmlProEditorChancel" :disabled="!ViewXmlProEditorChanged" variant="danger"><font-awesome-icon icon="times"/></b-btn>
						<b-btn @click="ViewXmlProEditorApply" :disabled="!ViewXmlProEditorChanged" variant="primary"><font-awesome-icon icon="check"/></b-btn>
					</b-button-group>
				</b-button-toolbar>
				<div class="viewxmlproeditor ohidden wtool">
					<ViewXmlProEditor v-model="xmlString" ref="ViewXmlProEditor" @changed="ViewXmlProEditorChange" :errors="xmlObjErrors" v-if="xmlString"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>xmlString</b> vorhanden!</div>
				</div>
			</b-tab>
		</b-tabs>
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import ViewEditor from './ToolPage/ViewEditor'
	import ViewObj from './ToolPage/ViewObj'
	import ViewXmlProEditor from './ToolPage/ViewXmlProEditor'
	import FunctionsTool from './ToolPage/functions.js'
	import test from './ToolPage/testData.js'

	export default {
		name: 'tool-page',
		data () {
			return {
				aTab: 0,
				objParser: undefined,
				xmlOrgString: undefined,
				xmlString: undefined,
				xmlStringError: undefined,
				xmlDom: undefined,
				xmlObj: undefined,
				xmlObjErrors: undefined,
				ViewXmlProEditorChanged: false,
				viewEditorShowComment: true,
				viewEditorShowAdd: true,
				viewObjShowComment: true,
				viewObjShowAdd: true,
			}
		},
		computed: {
			...mapState(['Options']),
			xmlObjError: function () {		// Gab es Fehler in dem aktuellen Tag
				var errors = []
				if (Array.isArray(this.xmlObjErrors)) {
					this.xmlObjErrors.forEach(function (v) {
						errors.push(((v.obj.line) ? 'Zeile ' + v.obj.line + ': ' : '') + this.htmlEncode(v.error))
					}, this)
				}
				return '<ul><li>' + errors.join('</li><li>') + '</li></ul>'
			}
		},
		watch: {
			aTab: function (nVal) {
				if (nVal === 3) {
					this.$refs.ViewXmlProEditor.refresh()
				}
			},
			xmlDom: function (nVal) {
				if (nVal) {
					var t0 = performance.now()
					var parsedObj = this.objParserUpdate(this.xmlDom2Obj(nVal), this.objParser)
					this.xmlObj = {c: parsedObj.obj, t: 'start'}
					this.xmlString = this.obj2xmlString(this.xmlObj)
					if (parsedObj.errors) {
						this.xmlObjErrors = parsedObj.errors
					}
					console.log('xmlDom update', Math.ceil(performance.now() - t0) + ' ms.')
				} else {
					this.xmlObj = undefined
				}
			},
			xmlString: function (nVal) {
				var t0 = performance.now()
				this.xmlDom = this.xmlString2xmlDom(nVal).xmlDom
				console.log('xmlString update', Math.ceil(performance.now() - t0) + ' ms.')
			},
			ViewXmlProEditorChanged: function (nVal) {
				if (nVal) {
					this.aTab = 3
				}
			}
		},
		mounted: function () {
			var t0 = performance.now()
			this.$store.dispatch('GET_PROJECT_PATH')
			this.objParser = this.xmlDom2Obj(this.xmlString2xmlDom(this.Options.parserFileContent).xmlDom, true)
			this.xmlOrgString = test.testXML
			this.xmlDom = this.xmlString2xmlDom(this.xmlOrgString).xmlDom
			console.log('ToolPage mounted', Math.ceil(performance.now() - t0) + ' ms.')
		},
		methods: {
			ViewXmlProEditorChange () {
				this.ViewXmlProEditorChanged = true
				console.log('ViewXmlProEditorChange')
			},
			ViewXmlProEditorApply () {
				// ToDo: Code überprüfen!
				// console.log(this.$refs.ViewXmlProEditor.getCode())
				if (confirm('Änderungen wirklich anwenden?')) {
					this.ViewXmlProEditorChanged = false
					this.$refs.ViewXmlProEditor.setValue()
				}
			},
			ViewXmlProEditorChancel () {
				if (confirm('Änderungen wirklich verwerfen?')) {
					this.ViewXmlProEditorChanged = false
					this.$refs.ViewXmlProEditor.reloadValue()
				}
			},
			obj2xmlString: FunctionsTool.obj2xmlString,
			xmlString2xmlDom: FunctionsTool.xmlString2xmlDom,
			xmlDomCheck: FunctionsTool.xmlDomCheck,
			xmlDom2Obj: FunctionsTool.xmlDom2Obj,
			objParserUpdate: FunctionsTool.objParserUpdate,
		},
		components: {
			ViewEditor,
			ViewObj,
			ViewXmlProEditor
		}
	}
</script>

<style>
	.tool-page {
		margin-top: 10px;
	}
	.tabc {
		border: 1px solid #eee;
		border-top: none;
		min-height: 75vh;
	}
	.lh76vh, .tabc > div > .scroll {
		height: 75vh;
	}
	.tabc > div > .scroll.wtool, .tabc > div > .ohidden.wtool {
		height: calc( 75vh - 49px )
	}
	.toolbar {
		margin-bottom: 0px;
		border-bottom: 1px solid #eee;
		background: #f8f9fa;
		padding: 8px 7px;
	}
	.main-toolbar {
		margin-bottom: 10px;
	}
	.fal-br {
		transform: translate(9px, 8px);
		color: #fff;
	}
</style>
