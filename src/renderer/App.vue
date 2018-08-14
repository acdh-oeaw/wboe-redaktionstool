<template>
	<div id="app">
		<b-navbar toggleable type="light" variant="light">
				<div class="container">
					<b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
					<b-navbar-brand>
						<span class="navbar-brand"><img alt="WBÖ" title="WBÖ" width="100" height="55" src="~@/assets//wboelogo100.png"> Redaktionstool</span>
					 </b-navbar-brand>
					<b-collapse is-nav id="nav_collapse">
							<b-navbar-nav class="ml-auto">
								<b-nav-item to="/home" :disabled="Files.changed">Home</b-nav-item>
								<b-nav-item to="/tool" :disabled="!Files.file">Tool</b-nav-item>
							</b-navbar-nav>
					</b-collapse>
				</div>
		</b-navbar>
		<div class="container">
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
	import 'bootstrap/dist/css/bootstrap.css'
	import 'bootstrap-vue/dist/bootstrap-vue.css'

	import searchInPage from 'electron-in-page-search'
	import { remote } from 'electron'

	import { mapState } from 'vuex'

	const inPageSearch = searchInPage(remote.getCurrentWebContents())

	export default {
		name: 'redaktionstool-electron-vue',
		data () {
			return {
				devMode: (process.env.NODE_ENV === 'development')
			}
		},
		computed: {
			...mapState(['Options']),
			...mapState(['Parser']),
			...mapState(['Files']),
		},
		methods: {
			keyUp: function (e) {
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
		created: function () {
			this.$store.dispatch('LOAD_SHOW')
			this.$store.dispatch('LOAD_LASTFILE')
			if (!this.Options.projectPath) {		// Projektpfad laden
				this.$store.dispatch('GET_PROJECT_PATH')
			}
			window.addEventListener('keyup', this.keyUp)
		},
		beforeDestroy: function () {
			inPageSearch.closeSearchWindow()
			window.removeEventListener('keyup', this.keyUp)
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
	.hidden {
		display: none;
	}
	.scroll {
		overflow-x: auto;
		overflow-y: scroll;
	}
	.ohidden {
		overflow: hidden;
	}
	.w100 {
		width: 100%;
	}
	.h100 {
		height: 100%;
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
</style>
