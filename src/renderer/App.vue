<template>
	<div id="app">
		<b-navbar toggleable="md" type="light" variant="light" class="rt-navbar">
				<div class="container">
					<b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
					<b-navbar-brand>
						<span class="navbar-brand"><img alt="WBÖ" title="WBÖ" width="100" height="55" src="~@/assets//wboelogo100.png"> Redaktionstool</span>
					 </b-navbar-brand>
					<b-collapse is-nav id="nav_collapse">
						<b-navbar-nav class="ml-auto">
							<b-nav-item to="/home" :disabled="Files.changed" :class="$route.path === '/home' ? ' active' : ''">Übersicht</b-nav-item>
							<b-nav-item to="/tool" :disabled="!Files.file" :class="$route.path === '/tool' ? ' active' : ''">Tool</b-nav-item>
							<b-nav-item to="/test" :class="$route.path === '/test' ? ' active' : ''" v-if="devMode">Test</b-nav-item>
							<b-nav-item-dropdown right>
								<template slot="button-content"><font-awesome-icon icon="address-card"/></template>
								<div class="d-flex flex-column bd-highlight">
									<div class="d-flex">
										<label @dblclick="zoom = 1; setZoom();" title="Doppelklick für 100%"  v-b-tooltip.hover for="options-zoom" class="px-2 py-1 m-0"><font-awesome-icon icon="search"/></label>
										<b-form-input v-model="zoom" @change="setZoom" id="options-zoom" type="range" class="p-0 mx-2 custom-range border-0" min="0.75" max="1.25" step="0.01"></b-form-input>
										<b-tooltip target="options-zoom">
											{{ parseInt(this.zoom * 100) }} %
										</b-tooltip>
									</div>
									<div class="d-flex">
										<label @dblclick="lineHeight = 1.5; setLineHeight();" title="Doppelklick für 100%"  v-b-tooltip.hover for="options-lineHeight" class="px-2 py-1 m-0"><font-awesome-icon icon="grip-lines"/></label>
										<b-form-input v-model="lineHeight" @change="setLineHeight" id="options-lineHeight" type="range" class="p-0 mx-2 custom-range border-0" min="1.5" max="6" step="0.1"></b-form-input>
										<b-tooltip target="options-lineHeight">
											{{ parseInt(this.lineHeight / 1.5 * 100) }} %
										</b-tooltip>
									</div>
								</div>
								<button @click="addBtnHover = !addBtnHover; setAddBtnHover();" class="addbtnhover"><font-awesome-icon icon="plus" class="mr-4"/> {{ addBtnHover ? 'Hover' : 'Klick' }}</button>
							</b-nav-item-dropdown>
							<b-nav-item to="/info" :class="$route.path === '/info' ? ' active' : ''" :disabled="Files.changed"><font-awesome-icon icon="info"/></b-nav-item>
						</b-navbar-nav>
					</b-collapse>
				</div>
		</b-navbar>
		<router-view :filesystem="filesystem"></router-view>
	</div>
</template>

<script>
	// import _ from 'lodash'
	import 'bootstrap/dist/css/bootstrap.css'
	import 'bootstrap-vue/dist/bootstrap-vue.css'

	// import searchInPage from 'electron-in-page-search'
	import { FindInPage } from 'electron-find'
	import { remote, webFrame } from 'electron'

	import { mapState } from 'vuex'

  import Filesystem from '@/functions/filesystem/Filesystem'

	const findInPage = new FindInPage(remote.getCurrentWebContents())

	export default {
		name: 'wboe-redaktionstool',
		data () {
			return {
				devMode: (process.env.NODE_ENV === 'development'),
				zoom: 1,
				lineHeight: 1.5,
				addBtnHover: true,
				filesystem: null
			}
		},
		mounted () {
			console.log(this.$route.path)
			this.filesystem = new Filesystem.Filesystem(this.Options)
			console.log('Filesystem', this.filesystem)
		},
		methods: {
			keyUp (e) {
				if (!this.Misc.searchLock) {
					if (e.ctrlKey && e.key === 'f') {
						findInPage.openFindWindow()
					}
					if (e.key === 'F3') {
						// console.log(findInPage.isFinding(), findInPage)
						if (findInPage.isFinding()) {
							if (e.shiftKey) {
								findInPage.findNext(false)
							} else {
								findInPage.findNext()
							}
						} else {
							findInPage.openFindWindow()
						}
					}
				}
			},
			setZoom () {
				this.$store.dispatch('SET_OPTIONS', { 'option': 'zoom', 'value': this.zoom })
				webFrame.setZoomFactor(parseFloat(this.Options.options.zoom))
			},
			setLineHeight () {
				this.$store.dispatch('SET_OPTIONS', { 'option': 'lineHeight', 'value': this.lineHeight })
			},
			setAddBtnHover () {
				this.$store.dispatch('SET_OPTIONS', { 'option': 'addBtnHover', 'value': this.addBtnHover })
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
			'Options.options.lineHeight' (nVal) {
				this.lineHeight = nVal
			},
			'Options.options.addBtnHover' (nVal) {
				this.addBtnHover = nVal
			},
			'Misc.searchLock' (nVal) {
				if (nVal) {
					findInPage.closeFindWindow()
				}
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
			if (!this.Options.parserPath) {		// Projektpfad laden
				this.$store.dispatch('GET_PARSER_PATH')
			}
			window.addEventListener('keyup', this.keyUp)
		},
		beforeDestroy () {
			findInPage.closeFindWindow()
			window.removeEventListener('keyup', this.keyUp)
			window.onbeforeunload = null
		}
	}
</script>

<style>
	@import url('~@/assets/css/lato.css');
	@import url('~@/assets/css/fiduz.css');
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
	.btn-grey {
    color: #000;
    background-color: #eee;
    border-color: #eee;
	}
	.addbtnhover {
		border: none;
		background: none;
		padding: 0 8px;
		width: 100%;
		text-align: left;
	}
	.addbtnhover:hover, .addbtnhover:focus {
		background: #eef;
	}
	.btn-icon-plus-black::after, .btn-icon-plus-white::after,
	.btn-icon-circle-notch-black::after, .btn-icon-circle-notch-white::after,
	.icon-edit-black::after, .icon-edit-white::after,
	.icon-map-marked-black::after, .icon-map-marked-white::after {
    width: 1em;
    display: inline-block;
		position: relative;
		top: 1px;
    font-size: inherit;
    height: 1em;
    overflow: visible;
    vertical-align: -0.125em;
  }
	.btn-icon-plus-black::after, .btn-icon-plus-white::after {
		width: 0.875em;
	}
	.icon-edit-black::after, .icon-edit-white::after {
		width: 1.125em;
	}
	.icon-map-marked-black::after, .icon-map-marked-white::after {
		margin: 0 5px;
		width: 1.125em;
	}
  .btn-icon-plus-black::after {
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='#000' d='M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z'%3E%3C/path%3E%3C/svg%3E");
  }
  .btn-icon-plus-white::after {
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='#fff' d='M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z'%3E%3C/path%3E%3C/svg%3E");
  }
	.btn-icon-circle-notch-black::after {
		content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='#000' d='M288 39.056v16.659c0 10.804 7.281 20.159 17.686 23.066C383.204 100.434 440 171.518 440 256c0 101.689-82.295 184-184 184-101.689 0-184-82.295-184-184 0-84.47 56.786-155.564 134.312-177.219C216.719 75.874 224 66.517 224 55.712V39.064c0-15.709-14.834-27.153-30.046-23.234C86.603 43.482 7.394 141.206 8.003 257.332c.72 137.052 111.477 246.956 248.531 246.667C393.255 503.711 504 392.788 504 256c0-115.633-79.14-212.779-186.211-240.236C302.678 11.889 288 23.456 288 39.056z'%3E%3C/path%3E%3C/svg%3E");
	}
	.btn-icon-circle-notch-white::after {
		content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='#fff' d='M288 39.056v16.659c0 10.804 7.281 20.159 17.686 23.066C383.204 100.434 440 171.518 440 256c0 101.689-82.295 184-184 184-101.689 0-184-82.295-184-184 0-84.47 56.786-155.564 134.312-177.219C216.719 75.874 224 66.517 224 55.712V39.064c0-15.709-14.834-27.153-30.046-23.234C86.603 43.482 7.394 141.206 8.003 257.332c.72 137.052 111.477 246.956 248.531 246.667C393.255 503.711 504 392.788 504 256c0-115.633-79.14-212.779-186.211-240.236C302.678 11.889 288 23.456 288 39.056z'%3E%3C/path%3E%3C/svg%3E");
	}
	.icon-edit-black::after {
		content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath fill='#000' d='M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z'%3E%3C/path%3E%3C/svg%3E");
	}
	.icon-edit-white::after {
		content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath fill='#fff' d='M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z'%3E%3C/path%3E%3C/svg%3E");
	}
	.icon-map-marked-black::after {
		content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath fill='#000' d='M288 0c-69.59 0-126 56.41-126 126 0 56.26 82.35 158.8 113.9 196.02 6.39 7.54 17.82 7.54 24.2 0C331.65 284.8 414 182.26 414 126 414 56.41 357.59 0 288 0zM20.12 215.95A32.006 32.006 0 0 0 0 245.66v250.32c0 11.32 11.43 19.06 21.94 14.86L160 448V214.92c-8.84-15.98-16.07-31.54-21.25-46.42L20.12 215.95zM288 359.67c-14.07 0-27.38-6.18-36.51-16.96-19.66-23.2-40.57-49.62-59.49-76.72v182l192 64V266c-18.92 27.09-39.82 53.52-59.49 76.72-9.13 10.77-22.44 16.95-36.51 16.95zm266.06-198.51L416 224v288l139.88-55.95A31.996 31.996 0 0 0 576 426.34V176.02c0-11.32-11.43-19.06-21.94-14.86z'%3E%3C/path%3E%3C/svg%3E");
	}
	.icon-map-marked-white::after {
		content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath fill='#fff' d='M288 0c-69.59 0-126 56.41-126 126 0 56.26 82.35 158.8 113.9 196.02 6.39 7.54 17.82 7.54 24.2 0C331.65 284.8 414 182.26 414 126 414 56.41 357.59 0 288 0zM20.12 215.95A32.006 32.006 0 0 0 0 245.66v250.32c0 11.32 11.43 19.06 21.94 14.86L160 448V214.92c-8.84-15.98-16.07-31.54-21.25-46.42L20.12 215.95zM288 359.67c-14.07 0-27.38-6.18-36.51-16.96-19.66-23.2-40.57-49.62-59.49-76.72v182l192 64V266c-18.92 27.09-39.82 53.52-59.49 76.72-9.13 10.77-22.44 16.95-36.51 16.95zm266.06-198.51L416 224v288l139.88-55.95A31.996 31.996 0 0 0 576 426.34V176.02c0-11.32-11.43-19.06-21.94-14.86z'%3E%3C/path%3E%3C/svg%3E");
	}

	@media print {
		#app {
			font-size: 0.9rem;
		}
		.rt-navbar {
			display: none!important;
		}
	}
</style>
