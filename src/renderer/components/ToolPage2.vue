<template>
	<div class="tool-page">
		<b-button-toolbar class="main-toolbar">
			<b-button-group size="sm" class="mr-1 mil-auto">
				<b-btn title="" v-b-tooltip.hover.html><font-awesome-icon icon="clipboard-check"/></b-btn>
			</b-button-group>
		</b-button-toolbar>
		<b-tabs v-model="aTab" content-class="tabc">
			<b-tab title="Editor">
				<div class="vieweditor scroll p20">
					<ViewEditor :parser="Parser.parser" v-if="Parser.parser && Parser.parser.content"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>parser</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="Vorschau">
			</b-tab>
			<b-tab title="Objekt">
			</b-tab>
			<b-tab title="XML">
			</b-tab>
			<b-tab title="Parser">
				<div class="viewparser scroll p20">
					<ViewParser :parser="Parser.parser" v-if="Parser.parser && Parser.parser.content"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>parser</b> vorhanden!</div>
				</div>
			</b-tab>
		</b-tabs>
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import ViewEditor from './ToolPage2/ViewEditor'
	import ViewParser from './ToolPage2/ViewParser'

	export default {
		name: 'tool-page-2',
		data () {
			return {
				aTab: 0,
			}
		},
		computed: {
			...mapState(['Options']),
			...mapState(['Parser']),
			...mapState(['Files']),
		},
		watch: {
		},
		mounted: function () {
			this.$store.dispatch('LOAD_PARSER_FILE')
			this.$store.dispatch('LOAD_FILE')
		},
		methods: {
		},
		components: {
			ViewEditor,
			ViewParser
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
