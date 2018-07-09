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

	export default {
		name: 'redaktionstool-electron-vue'
	}
</script>

<style>
	/* @import url('~@/assets/css/bootstrap.min.css'); */
	/* CSS */
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
		max-width: 80vw;
	}
	.tooltip-inner ul {
		margin: 0px;
		padding-left: 20px;
	}
	.tooltip-inner ul li {
		text-align: left;
	}
</style>
