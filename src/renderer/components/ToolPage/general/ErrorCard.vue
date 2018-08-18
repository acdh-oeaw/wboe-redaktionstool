<template>
	<b-card :header="title" no-body class="mib20 paneldecent" :border-variant="variant" :header-bg-variant="variant" v-if="error && length(error) > 0">
		<div slot="header"><button v-b-toggle="'collapse-errcard-' + _uid" class="header-btn-toggle" style="color: #fff;"><b>{{ title }} ({{ length(error) }})</b><font-awesome-icon :icon="((errorsOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/></button></div>
		<b-collapse v-model="errorsOpen" :id="'collapse-errcard-' + _uid">
			<b-card-body>
				<div class="g-errors">
					<ErrorContent :error="error" base=true @goto="goto" class="mi0 pl20"/>
				</div>
			</b-card-body>
		</b-collapse>
	</b-card>
</template>

<script>
	import ErrorContent from './ErrorContent'
	export default {
		name: 'ErrorCard',
		props: ['error', 'title', 'variant'],
		data () {
			return {
				errorsOpen: true
			}
		},
		methods: {
			length (val) {
				if (Array.isArray(val)) {
					return val.length
				} else {
					return Object.keys(val).length
				}
			},
			goto (aObj) {
				this.$emit('goto', aObj)
			},
		},
		components: {
			ErrorContent
		},
	}
</script>

<style scoped>
	div.g-errors {
		max-height: calc( 70vh - 200px );
		overflow: auto;
		padding: 8px 10px;
		margin: -8px;
	}
</style>
