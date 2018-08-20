<template>
	<span>GeoVerbreitung</span>
</template>

<script>
	import SelectPossibleValues from '../SelectPossibleValues'

	export default {
		name: 'GeoVerbreitung',
		props: {
			content: Object
		},
		data () {
			return {
				'refreshSelect': false,
			}
		},
		computed: {
		},
		watch: {
			'refreshSelect' (nVal) {
				if (nVal) {
					this.$nextTick(() => {
						this.refreshSelect = false
					})
				}
			},
		},
		mounted () {
		},
		methods: {
		},
		components: {
			SelectPossibleValues
		},
	}
</script>

<style scoped>
</style>
