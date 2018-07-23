<template>
	<div class="tool-page">
		<b-button-toolbar class="main-toolbar">
			<b-button-group size="sm" class="mr-1 mil-auto">
				<b-btn title="" v-b-tooltip.hover.html><font-awesome-icon icon="clipboard-check"/></b-btn>
			</b-button-group>
		</b-button-toolbar>
		<b-tabs v-model="aTab" content-class="tabc" nav-class="rel">
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
			<b-tab title="XML" :title-item-class="{'professional': true, 'hidden': !Options.show.professional}">
				<div class="viewxml scroll p20" v-if="Options.show.professional">
				</div>
			</b-tab>
			<b-tab title="Parser" :title-item-class="{'develope': true, 'hidden': !Options.show.develope}">
				<div class="viewparser scroll p20" v-if="Options.show.develope">
					<ViewParser :parser="Parser.parser" v-if="Parser.parser && Parser.parser.content"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>parser</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="XML Object" :title-item-class="{'develope': true, 'hidden': !Options.show.develope}">
				<div class="viewxmlobject scroll p20" v-if="Options.show.develope">
					<ViewXmlObject :object="Files.fileObject" v-if="Files.fileObject"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>fileObject</b> vorhanden!</div>
				</div>
			</b-tab>
			<template slot="tabs">
				<li class="nav-item extra">
					<b-button size="sm" @click="showTabView = !showTabView" class="vis-dropdown-button"><font-awesome-icon icon="eye"/></b-button>
					<div class="vis-dropdown" v-if="showTabView">
						<button @click="$store.dispatch('TOGGLE_SHOW', 'professional')"><font-awesome-icon :icon="((Options.show.professional) ? 'eye' : 'eye-slash')"/> Professional</button>
						<button @click="$store.dispatch('TOGGLE_SHOW', 'develope')"><font-awesome-icon :icon="((Options.show.develope) ? 'eye' : 'eye-slash')"/> Developer</button>
					</div>
				</li>
			</template>
		</b-tabs>
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import ViewEditor from './ToolPage2/ViewEditor'
	import ViewParser from './ToolPage2/ViewParser'
	import ViewXmlObject from './ToolPage2/ViewXmlObject'

	export default {
		name: 'tool-page-2',
		data () {
			return {
				aTab: 5,
				showTabView: false
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
			click (e) {
				if (this.showTabView && !(e.target.closest('.vis-dropdown') || e.target.closest('.vis-dropdown-button') || e.target.classList.contains('vis-dropdown') || e.target.classList.contains('vis-dropdown-button'))) {
					this.showTabView = false
				}
			}
		},
		created: function () {
			window.addEventListener('click', this.click)
		},
		beforeDestroy: function () {
			window.removeEventListener('click', this.click)
		},
		components: {
			ViewEditor,
			ViewParser,
			ViewXmlObject
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

	li.nav-item.extra {
		position: absolute;
		right: 0;
		padding: 5px;
	}
	li.nav-item.extra > a {
		border: none !important;
	}

	li.nav-item.develope > a, li.nav-item.professional > a {
		position: relative;
	}
	li.nav-item.develope > a {
		color: #5ca9fb;
	}
	li.nav-item.develope > a:after, li.nav-item.professional > a:after {
		position: absolute;
		top: -1px;
		right: 3px;
		font-size: 10px;
	}
	li.nav-item.develope > a:after {
		content: "Dev";
		color: #fd7a7a;
	}
	li.nav-item.professional > a:after {
		content: "Pro";
		color: #fbbe60;
	}

	.vis-dropdown {
		position: absolute;
		right: 5px;
		top: calc( 100% - 5px );
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 5px;
		z-index: 5000;
	}
	.vis-dropdown > button {
		white-space: nowrap;
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		margin-bottom: 2px;
		border: none;
		cursor: pointer;
	}
</style>
