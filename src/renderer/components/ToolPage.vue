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
				<b-button-toolbar class="toolbar">
					<b-button-group size="sm" class="mx-1 mil-auto">
						<b-btn disabled><font-awesome-icon icon="eye"/></b-btn>
						<b-btn :pressed.sync="viewobjShowComment"><font-awesome-layers><font-awesome-icon icon="comment"/><font-awesome-icon :icon="((viewobjShowComment) ? 'check' : 'times')" transform="shrink-6" class="fal-br"/></font-awesome-layers></b-btn>
						<b-btn :pressed.sync="viewobjShowAdd"><font-awesome-layers><font-awesome-icon icon="plus"/><font-awesome-icon :icon="((viewobjShowAdd) ? 'check' : 'times')" transform="shrink-6" class="fal-br"/></font-awesome-layers></b-btn>
					</b-button-group>
				</b-button-toolbar>
				<div class="viewobj scroll wtool p20">
					<ViewObj :xmlObj="xmlObj" :showComment="viewobjShowComment" :showAdd="viewobjShowAdd" v-if="xmlObj"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>xmlObj</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="XML">
				<div class="viewxmlproeditor ohidden lh76vh">
					<ViewXmlProEditor :xmlString="xmlString" ref="ViewXmlProEditor" v-if="xmlString"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>xmlString</b> vorhanden!</div>
				</div>
			</b-tab>
		</b-tabs>
	</div>
</template>

<script>
	import ViewObj from './ToolPage/ViewObj'
	import ViewXmlProEditor from './ToolPage/ViewXmlProEditor'
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
				xmlDom: undefined,
				xmlObj: undefined,
				viewobjShowComment: true,
				viewobjShowAdd: true
			}
		},
		watch: {
			aTab: function (nVal, oVal) {
				if (nVal === 3) {
					this.$refs.ViewXmlProEditor.refresh()
				}
			},
			xmlDom: function (nVal) {
				if (nVal) {
					this.xmlObj = {c: this.objParserUpdate(this.xmlDom2Obj(nVal), this.objParser), t: 'start'}
				} else {
					this.xmlObj = undefined
				}
			},
			xmlString: function (nVal, oVal) {
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
		},
		components: {
			ViewObj,
			ViewXmlProEditor,
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
	.tabc > div > .scroll.wtool {
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
