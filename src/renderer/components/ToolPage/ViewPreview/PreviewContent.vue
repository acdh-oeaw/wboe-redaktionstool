<template>
	<span :class="'inline-attr'">
		<code style="white-space: pre;">{{ content }}</code>
	</span>
</template>

<script>
	export default {
		name: 'PreviewContent',
		props: {
			content: Object,
		},
		data () {
			return {
			}
		},
		computed: {
		},
		watch: {
		},
		methods: {
		},
		components: {
		},
	}
</script>

<style scoped>
</style>
