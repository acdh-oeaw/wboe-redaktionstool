<template>
	<div :class="editorClasses" :data-tag="xmlObj.n">
		<template v-if="isValInArrOfSubProp(xmlObj, 'o.editorLayout', 'panel')">
			<b-card :header="header" no-body class="mib20">
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
			<span class="title" v-if="showTitle">{{ xmlObj.o.title }}:</span>
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
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.editorLayout', 'inlineChilds')) aClass.push('inlinechilds')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.editorLayout', 'isTitle')) aClass.push('istitle')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.editorLayout', 'isBlock')) aClass.push('isblock')
				return aClass.join(' ')
			},
			header: function () {		// Gibt den akutellen Titel aus den Optionen bzw. den Tag Titel zurück
				return ((this.hasSubProp(this.xmlObj, 'o.title')) ? this.xmlObj.o.title : this.xmlObj.n)
			},
			showTitle: function () {		// Soll der Titel angezeigt werden?
				var show = this.getValOfSubProp(this.xmlObj, 'o.title')
				if (show && this.isValInArrOfSubProp(this.xmlObj, 'o.tag', 'multibleSiblings')) {
					if (this.isValInArrOfSubProp(this.xmlObjParent, 'o.editorLayout', 'inlineChilds')) {
						if (this.oKey > 0) {
							var xKey = this.oKey - 1
							while (xKey >= 0) {
								if (this.xmlObjParent.c[xKey].n !== '#comment') {
									if (this.xmlObjParent.c[xKey].n === this.xmlObj.n) {
										show = false
									}
									break
								}
								xKey -= 1
							}
						}
					}
				}
				return show
			}
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
	.editor.error {
		border: 1px solid #f66;
	}
	.editor > .value {
		position: relative;
		border: 1px solid #ccc;
		padding: 1px 8px;
		display: inline-block;
		margin: 2px 0px;
	}
	.editor > .value.edit {
		border: 1px solid #beb;
	}
	.editor > .value.required {
		border: 1px solid #ccf;
	}
	.editor > .value.edit.empty {
		background: #ffe1a7;
	}
	.editor > .value.edit.required.empty {
		    background: #ffa7a7;
	}
	.editor.inlinechilds > .editor:not(.isblock) {
		display: inline-block;
		padding-right: 17px;
	}
	.editor.inlinechilds > .comment {
		display: inline-block;
	}
	.editor.istitle > .value {
		font-weight: bold;
	}
	.editor.inlinechilds > .editor.istitle:not(.isblock) > .value:after {
		content: ":";
	}
</style>
