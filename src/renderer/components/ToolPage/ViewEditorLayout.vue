<template>
	<div :class="editorClasses" :data-tag="xmlObj.n">
		<template v-if="isValInArrOfSubProp(xmlObj, 'o.editorLayout', 'panel') || isValInArrOfSubProp(xmlObj, 'o.editorLayout', 'panelDecent')">
			<b-card :header="header" no-body :class="{'mib20': true, 'paneldecent': isValInArrOfSubProp(xmlObj, 'o.editorLayout', 'panelDecent')}">
				<div slot="header" v-if="isValInArrOfSubProp(xmlObj, 'o.editorLayout', 'collapse')">
					<button v-b-toggle="'collapse-'+uid" class="header-btn-toggle">
						{{ header }}
						<font-awesome-icon :icon="((isOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/>
					</button>
				</div>
				<b-collapse v-model="isOpen" :id="'collapse-'+uid">
					<b-card-body>
						<slot></slot>
					</b-card-body>
				</b-collapse>
			</b-card>
		</template>
		<template v-else>
			<slot></slot>
		</template>
	</div>
</template>

<script>
	export default {
		name: 'ViewEditorLayout',
		props: {
			xmlObj: Object,
			xmlObjParent: Object,
			oKey: Number
		},
		data () {
			return {
				'isOpen': true,
				'uid': this._uid
			}
		},
		computed: {
			editorClasses: function () {		// Klassen für den aktuellen Tag
				var aClass = ['editor']
				if (this.xmlObj.n === '#comment') aClass.push('comment')
				if (this.xmlObj.n === '#text') aClass.push('text')
				if (Array.isArray(this.xmlObj.e)) aClass.push('error')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.editorLayout', 'inline')) aClass.push('inline')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.editorLayout', 'inlineChilds')) aClass.push('inlinechilds')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.editorLayout', 'isTitle')) aClass.push('istitle')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.editorLayout', 'isBlock')) aClass.push('isblock')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.editorLayout', 'frameDecent')) aClass.push('framedecent')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.tag', 'multibleSiblings')) aClass.push('multiblesiblings')
				return aClass.join(' ')
			},
			header: function () {		// Gibt den akutellen Titel aus den Optionen bzw. den Tag Titel zurück
				return ((this.hasSubProp(this.xmlObj, 'o.title')) ? this.xmlObj.o.title : this.xmlObj.n)
			},
		}
	}
</script>

<style scoped>
	.header-btn-toggle {
		margin: 0px;
		padding: 0px;
		border: none;
		background: none;
		width: 100%;
		text-align: left;
	}
	.header-btn-toggle .fa-icon {
		font-size: 23px;
	}
	.editor {
		position: relative;
	}
	.editor.inline .editor {
		padding-right: 17px;
	}
	.editor.error {
		border: 1px solid #f66;
	}
	.editor.inline {
		display: inline-block;
	}
	.editor > .value {
		position: relative;
		border: 1px solid #ccc;
		padding: 1px 8px;
		display: inline-block;
		margin: 2px 0px;
	}
	.editor > .value.edit, .editor > .value.variable {
		border: 1px solid #beb;
	}
	.editor > .value.required {
		border: 1px solid #ccf;
	}
	.editor > .value.edit.empty, .editor > .value.variable.empty {
		background: #ffe1a7;
		min-width: 29px;
	}
	.editor > .value.edit.required.empty, .editor > .value.variable.required.empty {
		    background: #ffa7a7;
	}
	.editor.inlinechilds > .editor:not(.isblock) {
		display: inline-block;
		padding-right: 17px;
	}
	.editor.inlinechilds > .comment {
		display: inline-block;
	}
	.editor > .editor > .addtag > button {
		width: 100%;
	}
	.editor.inlinechilds > .editor:not(.isblock) > .addtag {
		display: inline-block;
	}
	.editor.inlinechilds > .editor:not(.isblock) > .addtag > button > span {
		display: none;
	}
	.editor.istitle > .value {
		font-weight: bold;
	}
	.editor.inlinechilds > .editor.istitle:not(.isblock) > .value:after {
		content: ":";
	}
	.editor > .title.boldtitle {
		font-weight: bold;
	}
	.editor.framedecent {
		border-top: 1px solid #ddd;
		border-left: 1px solid #ddd;
		margin-left: -10px;
		padding-left: 10px;
		margin-top: 5px;
	}
	.paneldecent > .card-header {
		padding: 0.1rem 0.5rem;
	}
	.paneldecent > .card-body, .paneldecent > .collapse > .card-body {
		padding: 0.5rem;
	}
</style>
