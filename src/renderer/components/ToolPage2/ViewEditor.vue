<template>
	<div class="start" v-if="content === undefined && object !== undefined">
		<ErrorCard :error="object.getCompressedBaseError()" title="Fehler" variant="danger"/>
		<ErrorCard :error="object.warnings" title="Warnung" variant="warning"/>
		<div v-if="object.contentObj">
			<ViewEditor :content="object.contentObj"/>
		</div>
		<div v-else>
			Keine Content-Daten vorhanden
		</div>
	</div>

	<EditorObjFrame v-else-if="content !== undefined">
		{{ content.orgXmlObj.name }}
		<ViewEditor ref="childs" :content="aContent" :key="aKey" v-for="(aContent, aKey) in content.childs"  v-if="content.childs.length > 0 && showObj(aContent)"/>
	</EditorObjFrame>

	<div class="error" v-else>
		Kein "object" übergeben !!!!
	</div>
</template>

<script>
	// ToDo:
	// - Rahmen um obj per Komponente
	// - Mögliche AddKnöpfe an Rahmen übergeben
	// - Mögliche Contextmenüpunkte an Rahmen übergeben
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
		},
		methods: {
			showObj (obj) {
				if (obj && obj.orgXmlObj
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
