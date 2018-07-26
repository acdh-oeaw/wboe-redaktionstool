<template>
	<ul v-if="Array.isArray(aError)">
		<li v-for="errorObj in aError">
			<cError :error="errorObj"/>
		</li>
	</ul>
	<span v-else>
		<b v-if="aError.tree"><span v-for="node in aError.tree" class="error-tree">{{ node }}</span><br></b>
		<cError :error="aError.e" v-if="Array.isArray(aError.e)"/>
		<span v-else><i v-if="aError.t">{{ aError.t }} &gt; </i>{{ aError.e }}<br></span>
		<cError :error="aError.se" forceli="true" v-if="Array.isArray(aError.se)"/>
	</span>
</template>

<script>
	export default {
		name: 'cError',
		props: ['error', 'forceli'],
		data () {
			return {
			}
		},
		computed: {
			aError () {
				if (this.forceli && !Array.isArray(this.error)) {
					return [this.error]
				}
				if (!this.forceli && Array.isArray(this.error) && this.error.length === 1) {
					return this.error[0]
				}
				return this.error
			}
		},
		methods: {
		}
	}
</script>

<style scoped>
	span.error-tree+span.error-tree:before {
		content: " > "
	}
</style>
