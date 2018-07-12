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
			value: String,
			errors: Array
		},
		data () {
			return {
				code: '',
				cmOptions: ViewXmlProEditorFunctions.cmOptions,
				refreshCodemirror: true,
				codemirrorReady: false,
				errorMarks: []
			}
		},
		watch: {
			refreshCodemirror: ViewXmlProEditorFunctions.refreshCodemirror,
			value: function (nVal) {
				this.code = this.value
				this.$nextTick(() => {
					this.markErrors()
				})
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
			markErrors () {
				if (this.codemirrorReady) {
					this.errorMarks.forEach(function (m) {
						this.$refs.myCm.codemirror.removeLineClass(m, 'background', 'line-error')
						m.widgets[0].clear()
					}, this)
					this.errorMarks = []
					if (Array.isArray(this.errors)) {
						this.errors.forEach(function (v) {
							let aLineMarker = this.$refs.myCm.codemirror.addLineClass(v.obj.line - 1, 'background', 'line-error')
							var msg = document.createElement('div')
							var icon = msg.appendChild(document.createElement('span'))
							icon.innerHTML = '!!'
							icon.className = 'lint-error-icon'
							msg.appendChild(document.createTextNode(this.htmlEncode(v.error)))
							msg.className = 'lint-error'
							this.$refs.myCm.codemirror.addLineWidget(aLineMarker, msg, {coverGutter: true, noHScroll: true})
							this.errorMarks.push(aLineMarker)
						}, this)
					}
				}
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
	.line-error {
		background: #FBC2C4 !important;
		color: #8a1f11 !important;
	}
	span.lint-error-icon {
		display: inline-block;
		background: #f00;
		color: #fff;
		width: 16px;
    height: 16px;
    text-align: center;
		border-radius: 14px;
		margin: 2px 8px;
		margin-right: 30px;
	}
	.lint-error {
		background: #ffdfe0;
		font-family: arial;
		font-size: 12px;
	}
</style>
