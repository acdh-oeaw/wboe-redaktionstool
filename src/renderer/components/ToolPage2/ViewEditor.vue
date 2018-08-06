<template>
	<div class="start" v-if="content === undefined && object !== undefined">
		<b-card header="Errors" no-body class="mib20 paneldecent" border-variant="danger" header-bg-variant="danger" v-if="object.errors && length(object.errors) > 0">
			<div slot="header"><button v-b-toggle="'collapse-error'" class="header-btn-toggle" style="color: #fff;"><b>Errors ({{ length(object.errors) }})</b><font-awesome-icon :icon="((errorsOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/></button></div>
			<b-collapse v-model="errorsOpen" id="collapse-error">
				<b-card-body>
					<div class="g-errors">
						<cError :error="object.getCompressedBaseError()" base=true class="mi0 pl20"/>
					</div>
				</b-card-body>
			</b-collapse>
		</b-card>
		<b-card header="Warnings" no-body class="mib20 paneldecent" border-variant="warning" header-bg-variant="warning" v-if="object.warnings && length(object.warnings) > 0">
			<div slot="header"><button v-b-toggle="'collapse-error'" class="header-btn-toggle" style="color: #fff;"><b>Warnings ({{ length(object.warnings) }})</b><font-awesome-icon :icon="((warningsOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/></button></div>
			<b-collapse v-model="warningsOpen" id="collapse-error">
				<b-card-body>
					<div class="g-errors">
						<cError :error="object.warnings" base=true class="mi0 pl20"/>
					</div>
				</b-card-body>
			</b-collapse>
		</b-card>
		<div v-if="object.contentObj">
			<ViewEditor :content="object.contentObj"/>
		</div>
		<div v-else>
			Keine Content-Daten vorhanden
		</div>
	</div>

	<div class="obj" v-else-if="content !== undefined">
		xxx
	</div>

	<div class="error" v-else>
		Kein "object" übergeben !!!!
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import cError from './cError'
	export default {
		name: 'ViewEditor',
		props: {
			object: Object,
			content: Object,
		},
		data () {
			return {
				'isOpen': true,
				'errorsOpen': true,
				'warningsOpen': true,
			}
		},
		computed: {
			...mapState(['Options']),
		},
		methods: {
			length (val) {
				if (Array.isArray(val)) {
					return val.length
				} else {
					return Object.keys(val).length
				}
			},
		},
		components: {
			cError
		},
	}
</script>

<style scoped>
	span.tree+span.tree:before {
		content: " > "
	}
	code.lb {
		white-space: pre;
	}
	code.val {
		color: #007bff;
	}
	.card-header .val > i {
		color: #007bff;
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
	.icmd {
		font-size: 16px !important;
	}
	.paneldecent > .card-header {
		padding: 0.1rem 0.5rem;
	}
	.paneldecent > .card-body, .paneldecent > .collapse > .card-body, .paneldecent > .card-body, .paneldecent > .collapsing > .card-body {
		padding: 0.5rem;
	}
</style>
