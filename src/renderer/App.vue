<template>
	<div id="app">
		<b-navbar toggleable type="light" variant="light">
				<div class="container">
					<b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
					<b-navbar-brand>
						<router-link to="/" class="navbar-brand"><img alt="WBÖ" title="WBÖ" width="100" height="55" src="~@/assets//wboelogo100.png"> Redaktionstool</router-link>
					 </b-navbar-brand>
					<b-collapse is-nav id="nav_collapse">
							<b-navbar-nav class="ml-auto">
								<b-nav-item to="/">Home</b-nav-item>
								<b-nav-item to="/tool">Tool</b-nav-item>
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

	const inPageSearch = searchInPage(remote.getCurrentWebContents())

	export default {
		name: 'redaktionstool-electron-vue',
		methods: {
			keyUp: function (e) {
				if (e.ctrlKey && e.key === 'f') {
					if (!inPageSearch.opened) {
						inPageSearch.openSearchWindow()
					}
				}
				if (e.key === 'F3') {
					console.log(inPageSearch)
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
	body {
		font-family: 'Lato' !important;
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
	.p20 {
		padding: 20px;
	}
	.mit0 {
		margin-top: 0px;
	}
	.mil5 {
		margin-left: 5px;
	}
	.mil-auto {
		margin-left: auto !important;
	}
	.mib10 {
		margin-bottom: 10px;
	}
	.mib20 {
		margin-bottom: 20px;
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

	.btn-none, .btn-ve-select {
		background: none !important;
		border: none !important;
		border-radius: 0 !important;
		color: #333 !important;
		padding: 0 !important;
		margin: 0 !important;
	}
	.btn-ve-select {
		margin-left: -8px !important;
		padding-left: 8px !important;
		margin-right: -8px !important;
		padding-right: 8px !important;
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
</style>
