<template>
	<div id="app">
		<b-navbar toggleable="md" type="light" variant="light">
				<div class="container">
					<b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
					<b-navbar-brand>
						<span class="navbar-brand"><img alt="WBÖ" title="WBÖ" width="100" height="55" src="~@/assets//wboelogo100.png"> Redaktionstool</span>
					 </b-navbar-brand>
					<b-collapse is-nav id="nav_collapse">
							<b-navbar-nav class="ml-auto">
								<b-nav-item to="/home" :disabled="Files.changed">Home</b-nav-item>
								<b-nav-item to="/tool" :disabled="!Files.file">Tool</b-nav-item>
								<b-nav-item-dropdown right>
									<template slot="button-content"><font-awesome-icon icon="address-card"/></template>
									<div class="d-flex bd-highlight">
										<label @dblclick="zoom = 1; setZoom();" title="Doppelklick für 100%"  v-b-tooltip.hover for="options-zoom" class="px-2 py-1 m-0"><font-awesome-icon icon="search"/></label>
										<b-form-input v-model="zoom" @change="setZoom" id="options-zoom" type="range" class="p-0 mx-2 custom-range border-0" min="0.75" max="1.25" step="0.01"></b-form-input>
										<b-tooltip target="options-zoom">
											{{ parseInt(this.zoom * 100) }} %
										</b-tooltip>
									</div>
								</b-nav-item-dropdown>
								<b-nav-item to="/info" :disabled="Files.changed"><font-awesome-icon icon="info"/></b-nav-item>
							</b-navbar-nav>
						</b-navbar-nav>
					</b-collapse>
				</div>
		</b-navbar>
		<router-view></router-view>
	</div>
</template>

<script>
	// import _ from 'lodash'
	import 'bootstrap/dist/css/bootstrap.css'
	import 'bootstrap-vue/dist/bootstrap-vue.css'

	import searchInPage from 'electron-in-page-search'
	import { remote, webFrame } from 'electron'

	import { mapState } from 'vuex'

	const inPageSearch = searchInPage(remote.getCurrentWebContents())

	export default {
		name: 'redaktionstool-electron-vue',
		data () {
			return {
				devMode: (process.env.NODE_ENV === 'development'),
				zoom: 1,
			}
		},
		computed: {
			...mapState(['Options']),
			...mapState(['Parser']),
			...mapState(['Files']),
			...mapState(['Misc']),
		},
		watch: {
			'Options.options.zoom' (nVal) {
				this.zoom = nVal
			},
			'Misc.searchLock' (nVal) {
				if (nVal) {
					inPageSearch.closeSearchWindow()
				}
			}
		},
		methods: {
			keyUp (e) {
				if (!this.Misc.searchLock) {
					if (e.ctrlKey && e.key === 'f') {
						if (!inPageSearch.opened) {
							inPageSearch.openSearchWindow()
						}
					}
					if (e.key === 'F3') {
						if (!inPageSearch.opened) {
							inPageSearch.openSearchWindow()
						} else if (inPageSearch.isSearching()) {
							if (e.shiftKey) {
								inPageSearch.findNext(false)
							} else {
								inPageSearch.findNext()
							}
						}
					}
				}
			},
			setZoom () {
				this.$store.dispatch('SET_OPTIONS', { 'option': 'zoom', 'value': this.zoom })
				webFrame.setZoomFactor(parseFloat(this.Options.options.zoom))
			}
		},
		created () {
			this.$store.dispatch('GET_SHOW')
			this.$store.dispatch('GET_OPTIONS')
			webFrame.setZoomFactor(parseFloat(this.Options.options.zoom))
			this.$store.dispatch('GET_LASTFILE')
			if (!this.Options.projectPath) {		// Projektpfad laden
				this.$store.dispatch('GET_PROJECT_PATH')
			}
			window.addEventListener('keyup', this.keyUp)
			if (!this.devMode) {
				window.onbeforeunload = (e) => {
					if (this.Files.changed) {
						var answer = confirm('Es gab Änderungen die noch nicht abgespeichert wurden!\nWeiter bearbeiten?')
						if (answer) {
							e.returnValue = true
						}
					}
				}
			}
		},
		beforeDestroy () {
			inPageSearch.closeSearchWindow()
			window.removeEventListener('keyup', this.keyUp)
			window.onbeforeunload = null
		}
	}
</script>

<style>
	@import url('~@/assets/css/lato.css');
	.rel {
		position: relative;
	}
	dl.dots > dt {
		display: list-item;
		list-style-type: disc;
	}
	body {
		font-family: 'Lato' !important;
	}
	.bold {
		font-weight: bold;
	}
	.italic {
		font-style: italic;
	}
	.underline {
		text-decoration: underline;
	}
	.ls1pt {
		letter-spacing: 1pt;
	}
	.hidden {
		display: none;
	}
	.scroll {
		overflow-x: auto;
		overflow-y: scroll;
	}
	.scroll-y {
		overflow-y: scroll;
	}
	.ohidden {
		overflow: hidden;
	}
	.mw120px {
		min-width: 120px;
	}
	.mh30vh {
		max-height: 30vh;
	}
	.mh30vhscroll {
		max-height: 30vh;
		overflow-y: auto;
	}
	.w100 {
		width: 100%;
	}
	.h100 {
		height: 100%;
	}
	.h100vh {
		height: 100vh;
	}
	.p0 {
		padding: 0px;
	}
	.p20 {
		padding: 20px;
	}
	.pl10 {
		padding-left: 10px;
	}
	.pl20 {
		padding-left: 20px;
	}
	.mi0 {
		margin: 0px;
	}
	.mi20 {
		margin: 20px;
	}
	.mit0 {
		margin-top: 0px;
	}
	.mit5 {
		margin-top: 5px;
	}
	.mit10 {
    margin-top: 10px;
	}
	.mil5 {
		margin-left: 5px;
	}
	.mil-auto {
		margin-left: auto !important;
	}
	.mir5 {
		margin-right: 5px;
	}
	.mir10 {
		margin-right: 10px;
	}
	.mib10 {
		margin-bottom: 10px;
	}
	.mib20 {
		margin-bottom: 20px;
	}
	.mib50 {
		margin-bottom: 50px;
	}
	.mitb5 {
		margin-top: 5px;
		margin-bottom: 5px;
	}
	.navbar-brand > img {
		width: 100px;
		margin-top: -13px;
		float: left;
		margin-right: 20px;
		margin-bottom: -13px;
	}

	svg.fa-w-18 {
		margin: 0 5px;
	}

	.tooltip-inner {
		max-width: 80vw !important;
	}
	.tooltip-inner ul {
		margin: 0px !important;
		padding-left: 20px !important;
	}
	.tooltip-inner ul li {
		text-align: left !important;
	}

	.btn-none, .btn-ve-select, .btn-val-focus {
		background: none !important;
		border: none !important;
		border-radius: 0 !important;
		color: #333 !important;
		padding: 0 !important;
		margin: 0 !important;
	}
	.btn-none.mil5 {
		margin-left: 5px !important;
	}
	.btn-ve-select {
		margin-left: -8px !important;
		padding-left: 8px !important;
		margin-right: -8px !important;
		padding-right: 8px !important;
	}
	.dropdown-scroll > .dropdown-menu {
		max-height: 60vh;
		overflow: auto;
	}
	.electron-in-page-search-window {
		position: absolute;
		right: 0px;
		top: 0px;
		width: 300px;
		height: 36px;
		background-color: white;
	}
	.electron-in-page-search-window.search-inactive {
		visibility: hidden;
	}
	.electron-in-page-search-window.search-active {
		visibility: visible;
	}
	.dropdown-menu[x-placement="top-end"] {
		max-height: 95vh;
		overflow-y: auto;
	}
	.paneldecent > .card-header {
		padding: 0.1rem 0.5rem;
	}
	.paneldecent > .card-body, .paneldecent > .collapse > .card-body, .paneldecent > .card-body, .paneldecent > .collapsing > .card-body {
		padding: 0.5rem;
	}
	.header-btn-toggle {
		margin: 0px;
		padding: 0px;
		border: none;
		background: none;
		width: 100%;
		text-align: left;
	}
	.header-btn-toggle > .fa-icon {
		font-size: 23px;
	}
	.btn-xs, .btn-group-xs > .btn {
		padding: 0.0rem 0.25rem !important;
		font-size: 0.80rem !important;
		line-height: 1.4 !important;
		border-radius: 0.1rem !important;
	}
	a.disabled {
		cursor: not-allowed;
	}
	.modal-xl > div {
		max-width: 1200px !important;
	}
</style>
