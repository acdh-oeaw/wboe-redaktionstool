<template>
	<div class="start" v-if="!content && object">
		<div v-if="object.contentObj">
			<div v-if="(object.errors && length(object.errors) > 0) || (object.orgXmlObj.errors && length(object.orgXmlObj.errors) > 0) || (object.parserObj.errors && length(object.parserObj.errors) > 0)">Bearbeiten nicht möglich!</div>
			<ViewPreview :content="object.contentObj" v-else/>
		</div>
		<div v-else>
			Keine Content-Daten vorhanden
		</div>
	</div>

	<div v-else-if="content">
		xxx
	</div>

	<div class="error" v-else>
		Kein "object" übergeben !!!!
	</div>
</template>

<script>
	import { mapState } from 'vuex'

	export default {
		name: 'ViewPreview',
		props: {
			object: Object,
			content: Object,
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
