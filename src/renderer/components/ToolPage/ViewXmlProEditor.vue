<template>
	<codemirror ref="myCm"
							v-model="code"
							:options="cmOptions"
							@ready="onCmReady"
							@input="onCmCodeChange"></codemirror>
</template>

<script>
	import ViewXmlProEditorFunctions from './ViewXmlProEditorFunctions'
	import _ from 'lodash'

	export default {
		name: 'ViewXmlProEditor',
		props: {
			value: String
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
			refreshCodemirror: ViewXmlProEditorFunctions.refreshCodemirror,
			value: function (nVal) {
				this.code = this.value
			}
		},
		mounted () {
			this.code = this.value
		},
		methods: {
			onCmCodeChange: _.debounce(function (newCode) {
				if (this.code !== this.value) {
					this.$emit('changed')
				}
			}, 500),
			reloadValue () {
				this.code = this.value
			},
			setValue () {
				this.$emit('input', this.code)
			},
			getCode () {
				return this.code
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
