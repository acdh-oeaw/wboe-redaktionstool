<template>
	<div class="start" v-if="!content && object">
		<ErrorCard :error="object.getCompressedBaseError()" title="Fehler" variant="danger"/>
		<ErrorCard :error="object.warnings" title="Warnung" variant="warning"/>
		<div v-if="object.contentObj">
			<ViewEditor :content="object.contentObj"/>
		</div>
		<div v-else>
			Keine Content-Daten vorhanden
		</div>
	</div>

	<EditorObjFrame :content="content" v-else-if="content">
		<span v-if="valueType === 'fix'">{{ content.orgXmlObj.getValueByOption(this.content.parserObj.options.get('value'), false) }}</span>
		<span v-else-if="valueType === 'editable'">ZZZZZZZZZZZ</span>
		<template slot="childs" v-if="content.childs.length > 0">
			<ViewEditor ref="childs" :content="aContent" :key="aKey" v-for="(aContent, aKey) in content.childs" v-if="showObj(aContent)"/>
		</template>
	</EditorObjFrame>

	<div class="error" v-else>
		Kein "object" übergeben !!!!
	</div>
</template>

<script>
	// ToDo:
	// - Mögliche AddKnöpfe an Rahmen als Array übergeben
	// - Contextmenüpunkte im Rahmen behandeln?
	import { mapState } from 'vuex'
	import ErrorContent from './general/ErrorContent'
	import ErrorCard from './general/ErrorCard'
	import EditorObjFrame from './ViewEditor/EditorObjFrame'

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
		methods: {
			showObj (obj) {		// Soll das Element angezeigt werden?
				if (obj && obj.orgXmlObj
				&& (obj.parserObj && obj.parserObj.ready && obj.parserObj.useable)
				&& (obj.orgXmlObj.type === 'TEXT' || obj.orgXmlObj.type === 'ELEMENT')) {
					return true
				}
				return false
			}
		},
		components: {
			ErrorContent,
			ErrorCard,
			EditorObjFrame
		},
	}
</script>

<style scoped>
</style>
