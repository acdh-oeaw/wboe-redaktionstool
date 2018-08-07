<template>
	<div class="start" v-if="xmlObj.t === 'start'">
		<ViewEditor :xmlObj="xmlObjItem" :showComment="showComment" :showAdd="showAdd" v-for="(xmlObjItem, xmlObjKey) in xmlObj.c" :key="xmlObjKey" @childUpdate="childUpdate"/>
	</div>
	<div :class="{'comment': true, 'hidden': !showComment || xmlObj.commented}" v-else-if="xmlObj.n === '#comment'">
		<button :title="xmlObj.v" v-b-tooltip.hover v-if="showComment && !xmlObj.commented"><font-awesome-icon icon="comment"/></button>
	</div>
	<ViewEditorLayout :xmlObj="xmlObj" :showAdd="showAdd" :xmlObjParent="xmlObjParent" :oKey="$vnode.key" @addSibling="addSibling" @rightClickValue="rightClickValue" v-else>
		<span :class="'title' + ((isValInArrOfSubProp(xmlObj, 'o.editorLayout', 'boldTitle')) ? ' boldtitle' : '')" :title="'Tag: ' + xmlObj.n" v-if="showTitle"
					@contextmenu.prevent="rightClickValue"
					>{{ xmlObj.o.title }}:</span>
		<span :class="valueClasses"
					v-if="!refreshValue && (xmlObj.hasOwnProperty('v') || isValInArrOfSubProp(xmlObj, 'o.value', 'edit') || isValInArrOfSubProp(xmlObj, 'o.value', 'variable'))"
					:contenteditable="isValInArrOfSubProp(xmlObj, 'o.value', 'edit')"
					@contextmenu.prevent="rightClickValue"
					@focus="focusValue" @input="updateEditable" @keyup.enter="nextValue($event, $event.shiftKey)" @blur="updateValue">
			<template v-if="getValOfSubProp(xmlObj, 'o.fxForm.n') === 'select' && Array.isArray(getValOfSubProp(xmlObj, 'o.fxForm.c'))">
				<b-dropdown :text="displayValue" variant="ve-select" class="edit-select dropdown-scroll" ref="selectButton" @shown="selectFocus">
					<b-dropdown-item :class="{'active': (aOpt.v === xmlObj.v || aOpt.v === getValOfSubProp(aOpt, 'o.selectValue') || (!xmlObj.v && getValOfSubProp(aOpt, 'o.selectValue') === ''))}"
						v-for="(aOpt, aOptKey) in xmlObj.o.fxForm.c" :key="'bdd-' + aOptKey"
						@click="setSelectedOption(aOpt)">{{ aOpt.v }}</b-dropdown-item>
				</b-dropdown>
			</template>
			<template v-else>{{ displayValue }}</template>
		</span>
		<div class="addon">
			<button :title="xmlObjError" v-b-tooltip.hover.html v-if="Array.isArray(xmlObj.e)" class="error"><font-awesome-icon icon="exclamation-triangle"/></button>
			<button :title="getComments" v-b-tooltip.hover.html v-if="showComment && xmlObj.commented"><font-awesome-icon icon="comment"/></button>
		</div>
		<!-- <vue-context ref="contextMenuEditor" v-if="showContextMenuEditor">
			<div class="context-menu-editor-title">Tag: {{ xmlObj.n }}</div>
			<ul>
				<li v-if="xmlObj.o && xmlObj.add" @click="addSibling">
					<font-awesome-icon icon="plus"/>
					<span v-if="xmlObj.o.tagAddTitle"><b> {{ xmlObj.o.tagAddTitle }}</b></span>
					<span v-else><b> "{{ xmlObj.n }}" hinzufügen</b></span>
				</li>
				<li v-if="xmlObj.o && xmlObj.add" @click="removeObject">
					<font-awesome-icon icon="minus"/>
					<span><b> "{{ xmlObj.n }}" löschen</b></span>
				</li>
			</ul>
		</vue-context> -->
		<ViewEditor :xmlObj="xmlObjItem" :xmlObjParent="xmlObj" :showComment="showComment" :showAdd="showAdd" v-for="(xmlObjItem, xmlObjKey) in xmlObj.c" :key="xmlObjKey" v-if="isOpen" @childUpdate="childUpdate"/>
	</ViewEditorLayout>
	</div>

</template>

<script>
	// import { VueContext } from 'vue-context'
	import ViewEditorFunctions from './ViewEditorFunctions'
	import ViewEditorLayout from './ViewEditorLayout'
	import _ from 'lodash'

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
				'isOpen': true,
				'refreshValue': false,
				'showContextMenuEditor': false
			}
		},
		computed: {
			displayValue: function () {		// Aktueller Wert für Anzeige
				if (this.xmlObj.v) {
					return this.xmlObj.v
				} else {
					if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'edit')) {
						return '...'
					}
					if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'variable')) {
						if (this.getValOfSubProp(this.xmlObj, 'o.fxForm.n') === 'select' && Array.isArray(this.getValOfSubProp(this.xmlObj, 'o.fxForm.c'))) {
							return this.xmlObj.o.fxForm.c[0].v
						}
						return '---'
					}
				}
				return ''
			},
			valueClasses: function () {		// Klassen für den Wert
				var aClass = ['value']
				if (this.xmlObj.v === undefined || (typeof this.xmlObj.v === 'string' && this.xmlObj.v.length === 0)) {
					aClass.push('empty')
				}
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'edit')) aClass.push('edit')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'variable')) aClass.push('variable')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'required')) aClass.push('required')
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'select')) aClass.push('select')
				return aClass.join(' ')
			},
			xmlObjError: function () {		// Gab es Fehler in dem aktuellen Tag
				var errors = []
				if (Array.isArray(this.xmlObj.e)) {
					this.xmlObj.e.forEach(function (v) {
						errors.push(((v.obj.line) ? 'Zeile ' + v.obj.line + ': ' : '') + this.htmlEncode(v.error))
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
			},
			showTitle: function () {		// Soll der Titel angezeigt werden?
				var show = false
				if (!this.isValInArrOfSubProp(this.xmlObj, 'o.editorLayout', 'panel') && !this.isValInArrOfSubProp(this.xmlObj, 'o.editorLayout', 'panelDecent')) {
					show = this.getValOfSubProp(this.xmlObj, 'o.title')
					if (show && this.isValInArrOfSubProp(this.xmlObj, 'o.tag', 'multibleSiblings')) {
						if (this.isValInArrOfSubProp(this.xmlObjParent, 'o.editorLayout', 'inlineChilds')) {
							if (this.$vnode.key > 0) {
								var xKey = this.$vnode.key - 1
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
				}
				return show
			}
		},
		methods: {
			selectFocus: _.debounce(function () {		// Focus auf aktives Element in Auswahl setzen
				var aSel = this.$refs.selectButton.$el.querySelector('.dropdown-item.active')
				if (aSel) { aSel.focus() }
			}, 25),
			setSelectedOption: function (aOpt) {		// Aktives Element, in Auswahl, als Wert mit Attributen setzen
				if (!this.isValInArrOfSubProp(this.xmlObj, 'o.attribut', 'none')) {
					var aAttr = this.getValOfSubProp(aOpt, 'a')
					if (aAttr) {
						Object.keys(aAttr).map(function (aAttrKey) {
							if (!this.xmlObj.a) {
								this.$set(this.xmlObj, 'a', {})
							}
							this.$set(this.xmlObj.a, aAttrKey, aAttr[aAttrKey])
						}, this)
					}
				}
				var nVal = this.getValOfSubProp(aOpt, 'o.selectValue')
				this.$set(this.xmlObj, 'v', ((nVal !== undefined) ? nVal : aOpt.v))
				this.$emit('childUpdate', this.xmlObj, this.$vnode.key, 'update')
				this.$refs.selectButton.$el.children[0].focus()
			},
			addSibling: function () {		// Tag nach aktuellen einfügen
				if (this.xmlObj.add) {
					this.$emit('childUpdate', this.xmlObj.add, this.$vnode.key, 'insertAfter')
				}
			},
			removeObject: function () {		// Aktuellen Tag löschen
				if (this.xmlObj.add) {
					this.$emit('childUpdate', this.xmlObj, this.$vnode.key, 'remove')
				}
			},
			rightClickValue: function (e) {		// Kontextmenü anzeigen
				this.showContextMenuEditor = true
				// this.$nextTick(() => { this.$refs.contextMenuEditor.open(e) })
			},
			childUpdate: function (childData, childKey, updateType) {		// Daten update weiterleiten
				console.log('childUpdate', childData, childKey, updateType)
				if (updateType === 'update') {
					this.xmlObj.c[childKey] = childData
				} else if (updateType === 'insertAfter') {
					var aChildKey = childKey + 1
					while (this.xmlObj.c[aChildKey] && this.xmlObj.c[aChildKey].n === '#comment') {
						aChildKey += 1
					}
					this.xmlObj.c.splice(aChildKey, 0, childData)
				} else if (updateType === 'remove') {
					this.xmlObj.c.splice(childKey, 1)
				}
				this.$emit('childUpdate', this.xmlObj, this.$vnode.key, 'update')
			},
			updateEditable: function (e) {		// Eingabe bei bearbeitbaren Wert bereinigen
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'edit')) {
					var restoreCaretPosition = ViewEditorFunctions.saveCaretPosition(e.target)
					e.target.innerText = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '')
					restoreCaretPosition()
				} else {
					e.target.innerText = this.xmlObj.v
				}
			},
			updateValue: _.debounce(function (e) {		// Eingabe bei bearbeitbaren Wert setzen
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'edit')) {
					var nVal = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '').trim()
					if (nVal !== this.xmlObj.v) {
						this.$set(this.xmlObj, 'v', nVal)
						this.$emit('childUpdate', this.xmlObj, this.$vnode.key, 'update')
					}
					this.refreshValue = true
					this.$nextTick(() => { this.refreshValue = false })
				}
			}, 50),
			focusValue: function (e) {		// ggf. Platzhalter löschen
				if (this.isValInArrOfSubProp(this.xmlObj, 'o.value', 'edit') && !this.xmlObj.v) {
					e.target.innerText = ''
				}
			},
			nextValue: function (e, backward = false) {		// Zu nächsten bearbeitbaren Wert springen
				this.updateValue(e)
				var allEditableValuesElements = document.querySelectorAll('.editor > .value.edit, .editor > .value > .edit-select > button')
				for (var i = 0; i < allEditableValuesElements.length; i++) {
					if (document.activeElement === allEditableValuesElements[i]) {
						if (backward) {
							allEditableValuesElements[((i > 0) ? i - 1 : allEditableValuesElements.length - 1)].focus()
						} else {
							allEditableValuesElements[((i < allEditableValuesElements.length - 1) ? i + 1 : 0)].focus()
						}
						break
					}
				}
			}
		},
		components: {
			ViewEditorLayout,
			// VueContext
		}
	}
</script>

<style scoped>
	.comment > button {
		border: none;
		background: none;
		color: #333;
	}
	.editor > .addon, .card-body > .addon {
		position: absolute;
		right: 0px;
		top: 0px;
		width: 15px;
		z-index: 55;
	}
	.editor > .addon > button, .addon > button {
		border: none;
		padding: 0px;
		width: 15px;
		height: 15px;
		font-size: 11px;
		display: block;
		margin: 0px auto;
		background: none;
	}
	.editor > .addon > button.error, .addon > button.error {
		color: #d66;
	}
	.context-menu-editor-title {
		padding: 2px 10px;
		background: #eee;
	}
</style>
