<template>
	<div class="obj">
		<slot/>
	</div>
</template>

<script>
	export default {
		name: 'EditorObjFrame',
		props: {
		},
		data () {
			return {
				'isOpen': true,
			}
		},
		computed: {
		},
		methods: {
		},
	}
</script>

<style scoped>
</style>
