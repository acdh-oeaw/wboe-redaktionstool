<template>
	<div class="tool-page">
		<b-tabs v-model="aTab" content-class="tabc">
			<b-tab title="Editor" :disabled="ViewXmlProEditorChanged">
				<b-button-toolbar class="toolbar">
					<b-button-group size="sm" class="mx-1 mil-auto">
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
					<b-button-group size="sm" class="mx-1 mil-auto">
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
					<b-button-group size="sm" class="mx-1 mil-auto">
						<b-btn @click="ViewXmlProEditorChancel" :disabled="!ViewXmlProEditorChanged" variant="danger"><font-awesome-icon icon="times"/></b-btn>
						<b-btn @click="ViewXmlProEditorApply" :disabled="!ViewXmlProEditorChanged" variant="primary"><font-awesome-icon icon="check"/></b-btn>
					</b-button-group>
				</b-button-toolbar>
				<div class="viewxmlproeditor ohidden wtool">
					<ViewXmlProEditor v-model="xmlString" ref="ViewXmlProEditor" @changed="ViewXmlProEditorChange" v-if="xmlString"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>xmlString</b> vorhanden!</div>
				</div>
			</b-tab>
		</b-tabs>
	</div>
</template>

<script>
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
				ViewXmlProEditorChanged: false,
				viewEditorShowComment: true,
				viewEditorShowAdd: true,
				viewObjShowComment: true,
				viewObjShowAdd: true,
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
					console.log('xmlDom update')
					this.xmlObj = {c: this.objParserUpdate(this.xmlDom2Obj(nVal), this.objParser), t: 'start'}
					this.$nextTick(() => {
						this.xmlString = this.obj2xmlString(this.xmlObj)
					})
				} else {
					this.xmlObj = undefined
				}
			},
			xmlString: function (nVal) {
				console.log('xmlString update')
				this.$nextTick(() => {
					this.xmlDom = this.xmlString2xmlDom(nVal).xmlDom
				})
			},
			ViewXmlProEditorChanged: function (nVal) {
				if (nVal) {
					this.aTab = 3
				}
			}
		},
		mounted: function () {
			this.objParser = this.xmlDom2Obj(this.xmlString2xmlDom(test.testOptionObj).xmlDom, true)
			this.xmlOrgString = test.testXML
			this.xmlDom = this.xmlString2xmlDom(this.xmlOrgString).xmlDom
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
		margin-top: 40px;
	}
	.tabc {
		border: 1px solid #eee;
		border-top: none;
		min-height: 76vh;
	}
	.lh76vh, .tabc > div > .scroll {
		height: 76vh;
	}
	.tabc > div > .scroll.wtool, .tabc > div > .ohidden.wtool {
		height: calc( 76vh - 49px )
	}
	.toolbar {
		margin-bottom: 0px;
		border-bottom: 1px solid #eee;
		background: #f8f9fa;
		padding: 8px 7px;
	}
	.fal-br {
		transform: translate(9px, 8px);
		color: #fff;
	}
</style>
