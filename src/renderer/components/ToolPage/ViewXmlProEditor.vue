<template>
	<codemirror ref="myCm"
							:value="code"
							:options="cmOptions"
							@ready="onCmReady"
							@input="onCmCodeChange"></codemirror>
</template>

<script>
	import ViewXmlProEditorFunctions from './ViewXmlProEditorFunctions'

	export default {
		name: 'ViewXmlProEditor',
		props: {
			xmlString: String
		},
		data () {
			return {
				code: '',
				cmOptions: ViewXmlProEditorFunctions.cmOptions,
				refreshCodemirror: true,
				codemirrorReady: false
			}
		},
		watch: {
			code: function (nVal, oVal) {
				// console.log('changed')
			},
			refreshCodemirror: ViewXmlProEditorFunctions.refreshCodemirror,
		},
		mounted () {
			this.code = this.xmlString
		},
		methods: {
			onCmCodeChange (newCode) {
				// console.log('changed')
				this.code = newCode
			},
			refresh: ViewXmlProEditorFunctions.refresh,
			refreshCM: ViewXmlProEditorFunctions.refreshCM,
			onCmReady: ViewXmlProEditorFunctions.onCmReady,
		}
	}
</script>

<style>
	.vue-codemirror {
		height: 100%;
	}
	.CodeMirror {
		height: 100%;
	}
</style>
