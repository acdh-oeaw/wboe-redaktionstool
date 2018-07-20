<template>
	<div class="tool-page">
		<b-button-toolbar class="main-toolbar">
			<b-button-group size="sm" class="mr-1 mil-auto">
				<b-btn title="" v-b-tooltip.hover.html><font-awesome-icon icon="clipboard-check"/></b-btn>
			</b-button-group>
		</b-button-toolbar>
		<b-tabs v-model="aTab" content-class="tabc">
			<b-tab title="Editor">
			</b-tab>
			<b-tab title="Vorschau">
			</b-tab>
			<b-tab title="Objekt">
			</b-tab>
			<b-tab title="XML">
			</b-tab>
		</b-tabs>
	</div>
</template>

<script>
	import { mapState } from 'vuex'

	export default {
		name: 'tool-page-2',
		data () {
			return {
				aTab: 0,
			}
		},
		computed: {
			...mapState(['Options']),
		},
		watch: {
		},
		mounted: function () {
		},
		methods: {
		},
		components: {
		}
	}
</script>

<style>
	.tool-page {
		margin-top: 10px;
	}
	.tabc {
		border: 1px solid #eee;
		border-top: none;
		min-height: 75vh;
	}
	.lh76vh, .tabc > div > .scroll {
		height: 75vh;
	}
	.tabc > div > .scroll.wtool, .tabc > div > .ohidden.wtool {
		height: calc( 75vh - 49px )
	}
	.toolbar {
		margin-bottom: 0px;
		border-bottom: 1px solid #eee;
		background: #f8f9fa;
		padding: 8px 7px;
	}
	.main-toolbar {
		margin-bottom: 10px;
	}
	.fal-br {
		transform: translate(9px, 8px);
		color: #fff;
	}
</style>
