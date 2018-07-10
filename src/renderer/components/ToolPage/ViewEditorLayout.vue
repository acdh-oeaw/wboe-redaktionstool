<template>
	<div :class="editorClasses" :data-tag="xmlObj.n">
		<template v-if="xmlObj.o && xmlObj.o.editorLayout && xmlObj.o.editorLayout.indexOf('panel') > -1">
			<b-card :header="header" no-body class="mib20">
				<div slot="header" v-if="xmlObj.o && xmlObj.o.editorLayout && xmlObj.o.editorLayout.indexOf('collapse') > -1">
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
			editorClasses: function () {
				var aClass = ['editor']
				if (this.xmlObj.n === '#comment') aClass.push('comment')
				if (this.xmlObj.n === '#text') aClass.push('text')
				if (Array.isArray(this.xmlObj.e)) aClass.push('error')
				if (this.xmlObj.o && this.xmlObj.o.editorLayout && this.xmlObj.o.editorLayout.indexOf('inlineChilds') > -1) aClass.push('inlinechilds')
				if (this.xmlObj.o && this.xmlObj.o.editorLayout && this.xmlObj.o.editorLayout.indexOf('isTitle') > -1) aClass.push('istitle')
				if (this.xmlObj.o && this.xmlObj.o.editorLayout && this.xmlObj.o.editorLayout.indexOf('isBlock') > -1) aClass.push('isblock')
				return aClass.join(' ')
			},
			header: function () {
				return ((this.xmlObj.o && this.xmlObj.o.title) ? this.xmlObj.o.title : this.xmlObj.n)
			},
			showTitle: function () {
				var show = (this.xmlObj.o && this.xmlObj.o.title)
				if (show && this.xmlObj.o && this.xmlObj.o.tag && this.xmlObj.o.tag.indexOf('multibleSiblings') > -1) {
					if (this.xmlObjParent && this.xmlObjParent.o && this.xmlObjParent.o.editorLayout && this.xmlObjParent.o.editorLayout.indexOf('inlineChilds') > -1) {
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
		border: 1px solid #ccf;
		padding: 1px 8px;
		display: inline-block;
		margin: 2px 0px;
	}
	.editor > .value.edit {
	}
	.editor > .value.required {
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
