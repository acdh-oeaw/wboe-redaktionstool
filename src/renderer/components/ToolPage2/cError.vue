<template>
	<ul v-if="base || Array.isArray(aError)">
		<li v-for="(errorObj, errKey) in aError">
			<cError :error="errorObj"/>
		</li>
	</ul>
	<span v-else-if="typeof aError === 'string'">{{ aError }}<br></span>
	<span v-else>
		<b v-if="aError.obj">{{ aError.obj.uId }} - </b>
		<cError :error="aError.txt" v-if="aError.txt"/>
		<div v-if="Array.isArray(aError.err)" class="subArray"><cError :error="aError.err"/></div>
		<cError :error="aError.err" v-else-if="aError.err"/>
	</span>
</template>

<script>
	export default {
		name: 'cError',
		props: ['error', 'base'],
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
		mounted: function () {
			console.log(this.error, this.aError)
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
