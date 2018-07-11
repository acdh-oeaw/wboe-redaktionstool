<template>
	<div class="start" v-if="xmlObj.t === 'start'">
		<ViewEditor :xmlObj="xmlObjItem" :showComment="showComment" :showAdd="showAdd" v-for="(xmlObjItem, xmlObjKey) in xmlObj.c" :key="xmlObjKey" :nextNodeName="((xmlObj.c[xmlObjKey + 1]) ? xmlObj.c[xmlObjKey + 1].n : undefined)"/>
	</div>
	<div class="comment" v-else-if="xmlObj.n === '#comment'">
		<button :title="xmlObj.v" v-b-tooltip.hover v-if="showComment && !xmlObj.commented"><font-awesome-icon icon="comment"/></button>
	</div>
	<ViewEditorLayout :xmlObj="xmlObj" :xmlObjParent="xmlObjParent" :oKey="$vnode.key" v-else>
		<span :class="valueClasses" v-if="xmlObj.hasOwnProperty('v') || isValInArrOfSubProp(xmlObj, 'o.value', 'edit')" @click="clickValue()">{{ displayValue }}</span>
		<div class="addon">
			<button :title="xmlObjError" v-b-tooltip.hover.html v-if="Array.isArray(xmlObj.e)" class="error"><font-awesome-icon icon="exclamation-triangle"/></button>
			<button :title="getComments" v-b-tooltip.hover.html v-if="showComment && xmlObj.commented"><font-awesome-icon icon="comment"/></button>
		</div>
		<ViewEditor :xmlObj="xmlObjItem" :xmlObjParent="xmlObj" :showComment="showComment" :showAdd="showAdd" v-for="(xmlObjItem, xmlObjKey) in xmlObj.c" :key="xmlObjKey" :nextNodeName="((xmlObj.c[xmlObjKey + 1]) ? xmlObj.c[xmlObjKey + 1].n : undefined)" v-if="isOpen"/>
	</ViewEditorLayout>

		<!-- <div class="item add-item" v-if="showAdd && xmlObj.n !== nextNodeName && xmlObj.o && xmlObj.add">
			<button><font-awesome-icon icon="plus"/>
				<span v-if="xmlObj.o.tagAddTitle"><b> {{ xmlObj.o.tagAddTitle }}</b></span>
				<span v-else><b> "{{ xmlObj.n }}" hinzufügen</b></span>
			</button>
		</div> -->
	</div>

</template>

<script>
	import ViewEditorLayout from './ViewEditorLayout'

	export default {
		name: 'ViewEditor',
		props: {
			xmlObj: Object,
			xmlObjParent: Object,
			nextNodeName: String,
			showComment: Boolean,
			showAdd: Boolean
		},
		data () {
			return {
				'isOpen': true
			}
		},
		computed: {
			displayValue: function () {		// Aktueller Wert für Anzeige
				return ((this.xmlObj.v) ? this.xmlObj.v : ((this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'edit')) ? '...' : ''))
			},
			valueClasses: function () {		// Klassen für den Wert
				var aClass = ['value']
				if (this.xmlObj.v === undefined || (typeof this.xmlObj.v === 'string' && this.xmlObj.v.length === 0)) {
					aClass.push('empty')
				}
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'edit')) aClass.push('edit')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'required')) aClass.push('required')
				return aClass.join(' ')
			},
			xmlObjError: function () {		// Gab es Fehler in dem aktuellen Tag
				var errors = []
				if (Array.isArray(this.xmlObj.e)) {
					this.xmlObj.e.forEach(function (v) {
						errors.push(this.htmlEncode(v))
					}, this)
				}
				return '<ul><li>' + errors.join('</li><li>') + '</li></ul>'
			},
			getComments: function () {		// Kommentare zu aktuellen Tag als HTML-Liste
				var comments = []
				if (this.xmlObj.commented) {
					this.xmlObj.commented.forEach(function (v) {
						if (this.xmlObjParent && this.xmlObjParent.c[v] && this.xmlObjParent.c[v].n === '#comment') {
							comments.push(this.htmlEncode(this.xmlObjParent.c[v].v))
						}
					}, this)
				}
				return '<ul><li>' + comments.join('</li><li>') + '</li></ul>'
			}
		},
		methods: {
			clickValue: function () {
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'edit')) {
					console.log('clickValue')
				}
			}
		},
		components: {
			ViewEditorLayout
		}
	}
</script>

<style scoped>
	.comment > button {
		border: none;
		background: none;
		color: #333;
	}
	.editor > .addon {
		position: absolute;
		right: 0px;
		top: 0px;
		width: 15px;
		z-index: 1000;
	}
	.editor > .addon > button {
		border: none;
		padding: 0px;
		width: 15px;
		height: 15px;
		font-size: 11px;
		display: block;
		margin: 0px auto;
		background: none;
	}
	.editor > .addon > button.error {
		color: #d66;
	}
</style>
