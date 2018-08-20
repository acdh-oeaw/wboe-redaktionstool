<template>
	<div class="start" v-if="!content && object">
		<ErrorCard :error="object.orgXmlObj.errors" title="Kritischer Fehler in XML-Datei!" variant="danger" @goto="goToObject"/>
		<ErrorCard :error="object.parserObj.errors" title="Kritischer Fehler in Parser-Datei!" variant="danger" @goto="goToObject"/>
		<ErrorCard :error="object.getCompressedBaseError()" title="Fehler" variant="danger" @goto="goToObject"/>
		<ErrorCard :error="object.warnings" title="Warnung" variant="warning" @goto="goToObject"/>
		<div v-if="object.contentObj">
			<div v-if="(object.errors && length(object.errors) > 0) || (object.orgXmlObj.errors && length(object.orgXmlObj.errors) > 0) || (object.parserObj.errors && length(object.parserObj.errors) > 0)">Bearbeiten nicht möglich!</div>
			<ViewEditor :content="object.contentObj" v-else/>
		</div>
		<div v-else>
			Keine Content-Daten vorhanden
		</div>
	</div>

	<EditorObjFrame :content="content" v-else-if="content">
		<template  v-if="content.parserObj.options && content.parserObj.options.get('layout.showAttributeBefore')">
			<InlineAttributes :content="content" :attrOpt="attrOpt" :attrKey="attrKey" :key="content.uId + '-attr-' + attrKey" v-for="(attrOpt, attrKey) in content.parserObj.options.get('layout.showAttributeBefore')"/>
		</template>

		<span :class="{ 'val-fix': true, 'bold': content.parserObj.options.get('layout.bold'), 'italic': content.parserObj.options.get('layout.italic'), 'underline': content.parserObj.options.get('layout.underline') }" v-if="valueType === 'fix'">
			{{ content.orgXmlObj.getValueByOption(this.content.parserObj.options.get('value'), false) }}
		</span>
		<GeoVerbreitung :content="content" v-else-if="content.parserObj && content.parserObj.options && content.parserObj.options.get('editor.fxFunction.name') === 'GeoVerbreitung'"/>
		<EditableValue :content="content" v-else-if="valueType === 'editable'"/>

		<template slot="childs" v-if="content.childs.length > 0 && !(content.parserObj && content.parserObj.options && content.parserObj.options.get('editor.fxFunction'))">
			<ViewEditor ref="childs" :content="aContent" :key="aContent.uId + '-' + aKey" v-for="(aContent, aKey) in content.childs" v-if="showObj(aContent)"/>
		</template>

		<template  v-if="content.parserObj.options && content.parserObj.options.get('layout.showAttributeAfter')">
			<InlineAttributes :content="content" :attrOpt="attrOpt" :attrKey="attrKey" :key="content.uId + '-attr-' + attrKey" v-for="(attrOpt, attrKey) in content.parserObj.options.get('layout.showAttributeAfter')"/>
		</template>
	</EditorObjFrame>

	<div class="error" v-else>
		Kein "object" übergeben !!!!
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import ErrorContent from './general/ErrorContent'
	import ErrorCard from './general/ErrorCard'
	import EditorObjFrame from './ViewEditor/EditorObjFrame'
	import EditableValue from './ViewEditor/EditableValue'
	import InlineAttributes from './ViewEditor/InlineAttributes'
	// fxFunctions
	import GeoVerbreitung from './ViewEditor/fxFunctions/GeoVerbreitung'

	import _ from 'lodash'

	export default {
		name: 'ViewEditor',
		props: {
			object: Object,
			content: Object,
		},
		data () {
			return {
				'isOpen': true,
				'errorsOpen': true,
				'warningsOpen': true,
			}
		},
		computed: {
			...mapState(['Options']),
			valueType () {		// Ist der aktuelle Wert 'fix', 'editable' oder 'none'?
				if (this.content.parserObj.options && this.content.parserObj.options.get('value')) {
					if (!this.content.parserObj.options.get('value.edit.use')) {
						return 'fix'
					}
					return 'editable'
				}
				return 'none'
			}
		},
		watch: {
		},
		mounted () {
		},
		methods: {
			showObj (obj) {		// Soll das Element angezeigt werden?
				if (obj && obj.orgXmlObj
				&& (obj.parserObj && obj.parserObj.ready && obj.parserObj.useable)
				&& (obj.orgXmlObj.type === 'TEXT' || obj.orgXmlObj.type === 'ELEMENT')
				&& !(obj.parserObj.options && obj.parserObj.options.get('layout.hidden'))) {
					return true
				}
				return false
			},
			length (val) {
				if (Array.isArray(val)) {
					return val.length
				} else {
					return Object.keys(val).length
				}
			},
			goToObject (aObj) {
				let aElement = document.getElementById('eo' + aObj.uId)
				if (aElement) {
					// console.log(aElement)
					let opendPanels = false
					if (aElement.offsetParent === null) {
						let pElement = aElement.parentElement
						while (pElement) {
							if (pElement.classList.contains('fxcollapse')) {
								if (pElement.__vue__ && pElement.__vue__.$parent) {
									if (pElement.__vue__.$parent.hasOwnProperty('isOpen') && pElement.__vue__.$parent.isOpen === false) {
										pElement.__vue__.$parent.isOpen = true
										opendPanels = true
									} else if (pElement.__vue__.$parent.$parent.hasOwnProperty('isOpen') && pElement.__vue__.$parent.$parent.isOpen === false) {
										pElement.__vue__.$parent.$parent.isOpen = true
										opendPanels = true
									}
								}
							}
							pElement = pElement.parentElement
						}
					}
					if (opendPanels) {
						this.scrollToObjectv(aElement)
					} else {
						this.$parent.$el.getElementsByClassName('vieweditorobject')[0].scrollTop = aElement.getBoundingClientRect().top - 300
					}
				}
			},
			scrollToObjectv: _.debounce(function (aElement) {
				this.$parent.$el.getElementsByClassName('vieweditorobject')[0].scrollTop = aElement.getBoundingClientRect().top - 300
			}, 250),
		},
		components: {
			ErrorContent,
			ErrorCard,
			EditorObjFrame,
			EditableValue,
			InlineAttributes,
			GeoVerbreitung,
		},
	}
</script>

<style scoped>
	.inline {
		display: inline;
		cursor: default;
	}
	.val-fix {
		padding-bottom: 3px;
    border-radius: 2px;
	}
	.val-fix:hover {
		background: #eee;
	}
	.enumeraterom {
		font-weight: bold;
	}
</style>
