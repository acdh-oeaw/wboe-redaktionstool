<template>
	<ul v-if="base || Array.isArray(aError)">
		<li v-for="(errorObj, errKey) in aError">
			<b v-if="fxUseErrKey(errKey)">{{ fxErrKey(errKey) }}</b><ErrorContent :error="errorObj" :noObj="fxUseErrKey(errKey)"/>
		</li>
	</ul>
	<span v-else-if="typeof aError === 'string'">{{ aError }}<br></span>
	<span v-else>
		<b v-if="aError.obj && !noObj">{{ aError.obj.uId }} - </b>
		<ErrorContent :error="aError.txt" v-if="aError.txt"/>
		<div v-if="Array.isArray(aError.err)" class="subArray"><ErrorContent :error="aError.err"/></div>
		<ErrorContent :error="aError.err" v-else-if="aError.err"/>
	</span>
</template>

<script>
	export default {
		name: 'ErrorContent',
		props: ['error', 'base', 'noObj'],
		data () {
			return {
			}
		},
		computed: {
			aError () {
				if (Array.isArray(this.error) && this.error.length === 1) {
					return this.error[0]
				} else {
					return this.error
				}
			}
		},
		methods: {
			fxUseErrKey: function (key) {
				if (typeof key === 'string' && key.indexOf('-') > -1 && key.split('-')[0] !== key.split('-')[1]) {
					return true
				}
			},
			fxErrKey: function (key) {
				if (typeof key === 'string' && key.indexOf('-') > -1 && key.split('-')[0] !== key.split('-')[1]) {
					return key + ' - '
				}
				return ''
			}
		},
		mounted: function () {
			// console.log(this.error, this.aError)
		}
	}
</script>

<style scoped>
	.subArray {
		display: inline-flex;
	}
	.subArray > ul {
		padding-left: 20px;
	}
</style>
