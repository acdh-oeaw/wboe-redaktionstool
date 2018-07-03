<template>
	<div>
		ProEditor
		<!-- <monaco-editor
			class="editor"
			v-model="code"
			language="javascript">
  </monaco-editor> -->
	</div>
</template>

<script>
	// import * as monaco from 'monaco-editor'
	// import MonacoEditor from 'vue-monaco'
	export default {
		name: 'ViewXmlProEditor',
		props: {
			xmlString: String
		},
		data () {
			return {
				'code': 'Test ...'
			}
		},
		mounted () {
			// console.log(monaco)
		},
		methods: {
		},
		components: {
			// MonacoEditor
		}
	}
</script>

<style scoped>
</style>
