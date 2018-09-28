<template>
	<div class="start" v-if="start">
		<div v-if="object.contentObj">
			<div v-if="(object.errors && length(object.errors) > 0) || (object.orgXmlObj.errors && length(object.orgXmlObj.errors) > 0) || (object.parserObj.errors && length(object.parserObj.errors) > 0)">Bearbeiten nicht möglich!</div>
			<ViewPreview :object="object" :preview="object.parserObj.previewObj" v-else/>
		</div>
		<div v-else>
			Keine Content-Daten vorhanden
		</div>
	</div>

	<div v-else-if="!start && preview && object">
		<hr>
		<code style="white-space: pre;">{{ preview }}</code>
		<hr>
	</div>

	<div class="error" v-else>
		Kein "object/preview" übergeben !!!!
	</div>
</template>

<script>
	import { mapState } from 'vuex'

	export default {
		name: 'ViewPreview',
		props: {
			start: Boolean,
			object: Object,
			preview: Array,
		},
		data () {
			return {
			}
		},
		computed: {
			...mapState(['Options']),
		},
		watch: {
		},
		mounted () {
		},
		methods: {
			length (val) {
				if (Array.isArray(val)) {
					return val.length
				} else {
					return Object.keys(val).length
				}
			},
		},
		components: {
		},
	}
</script>

<style scoped>
	.inline {
		display: inline;
		cursor: default;
	}
</style>
