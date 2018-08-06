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

	<div class="obj" v-else-if="content !== undefined">
		{{ content.orgXmlObj.name }}
		<ViewEditor ref="childs" :content="aContent" :key="aKey" v-for="(aContent, aKey) in content.childs"  v-if="content.childs.length > 0 && showObj(aContent)"/>
	</div>

	<div class="error" v-else>
		Kein "object" übergeben !!!!
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import ErrorContent from './general/ErrorContent'
	import ErrorCard from './general/ErrorCard'

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
			ErrorCard
		},
	}
</script>

<style scoped>
</style>
