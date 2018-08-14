<template>
	<div class="start" v-if="!content && object">
		<ErrorCard :error="object.getCompressedBaseError()" title="Fehler" variant="danger"/>
		<ErrorCard :error="object.warnings" title="Warnung" variant="warning"/>
		<div v-if="object.contentObj">
			<div v-if="object.errors && length(object.errors) > 0">Datei enthält Fehler!</div>
			<ViewEditor :content="object.contentObj" v-else/>
		</div>
		<div v-else>
			Keine Content-Daten vorhanden
		</div>
	</div>

	<div class="inline" v-else-if="content">
		<EditorObjFrame :content="content">
			<span :class="{ 'val-fix': true, 'bold': content.parserObj.options.get('layout.bold'), 'italic': content.parserObj.options.get('layout.italic'), 'underline': content.parserObj.options.get('layout.underline') }" v-if="valueType === 'fix'">
				{{ content.orgXmlObj.getValueByOption(this.content.parserObj.options.get('value'), false) }}
			</span>
			<EditableValue :content="content" v-else-if="valueType === 'editable'"/>
			<template slot="childs" v-if="content.childs.length > 0">
				<ViewEditor ref="childs" :content="aContent" :key="aContent.uId + '-' + aKey" v-for="(aContent, aKey) in content.childs" v-if="showObj(aContent)"/>
			</template>
		</EditorObjFrame>
	</div>

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
		},
		components: {
			ErrorContent,
			ErrorCard,
			EditorObjFrame,
			EditableValue
		},
	}
</script>

<style scoped>
	.inline {
		display: inline;
		cursor: default;
	}
	.val-fix {
		padding: 0px 3px;
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
