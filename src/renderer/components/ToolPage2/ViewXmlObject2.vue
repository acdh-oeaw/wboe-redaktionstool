<template>
	<div class="start" v-if="content === undefined && object !== undefined">
		<b-card header="Errors" no-body class="mib20 paneldecent" border-variant="danger" header-bg-variant="danger" v-if="object.errors && length(object.errors) > 0">
			<div slot="header"><button v-b-toggle="'collapse-error'" class="header-btn-toggle" style="color: #fff;"><b>Errors ({{ length(object.errors) }})</b><font-awesome-icon :icon="((errorsOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/></button></div>
			<b-collapse v-model="errorsOpen" id="collapse-error">
				<b-card-body>
					<div class="g-errors">
						<!-- {{ object.errors }} -->
					</div>
				</b-card-body>
			</b-collapse>
		</b-card>
		<div v-if="object.content">
			<ViewXmlObject2 :content="aContent" :key="aKey" v-for="(aContent, aKey) in object.content"/>
		</div>
		<div v-else>
			Keine Content-Daten vorhanden
		</div>
	</div>

	<div class="obj" v-else-if="content !== undefined">
		<b-card :header="content.name" no-body class="mib10 paneldecent">
			<div slot="header">
				<button v-b-toggle="'collapse-' + _uid" class="header-btn-toggle">
					<font-awesome-icon icon="question-circle" class="fa-icon icmd" v-if="content.type === 'UNKNOWN'"/>
					<span><b>{{ content.name }}</b></span>
					<span class="val" v-if="content.value"> = <i>{{ tranculatedValue }}</i></span>
					<span class="attribut" v-for="(attrOpt, attr) in content.attributes">
						{{ attr + ((attrOpt) ? ':' : '') }}
						<span v-if="attrOpt">{{ attrOpt }}</span>
					</span>
					<font-awesome-icon :icon="((isOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/>
					<font-awesome-icon icon="exclamation-triangle" class="float-right fa-icon mir5" style="color: #d33;" v-if="length(content.errors) > 0"/>
				</button>
			</div>
			<b-collapse v-model="isOpen" :id="'collapse-' + _uid">
				<b-card-body>
					<div v-if="length(content.errors)">
						<b>Fehler:</b><br>
						{{ content.errors }}
					</div>
					<b-button-toolbar aria-label="Toolbar with button groups and dropdown menu">
						<b-button-group size="sm" class="mr-1">
							<b-button @click="setInfoOpen(undefined)"><font-awesome-icon :icon="((infoOpen !== undefined) ? 'eye' : 'eye-slash')" class="fa-icon"/></b-button>
							<b-button @click="setInfoOpen('value')" v-if="content.value" :pressed="infoOpen === 'value'" variant="outline-secondary"><b>Value</b></b-button>
							<b-button @click="setInfoOpen('comment')" v-if="content.comments.length > 0" :pressed="infoOpen === 'comment'" variant="outline-secondary"><b>Comments</b></b-button>
						</b-button-group>
						<b-input-group size="sm" class="mx-1" v-if="content.childs.length > 0">
							<b-input-group-prepend is-text><b>Kinder:</b>&nbsp;({{ content.childs.length }})</b-input-group-prepend>
							<b-button @click="showChilds(true)" class="form-control" variant="outline-secondary"><font-awesome-icon icon="eye" class="fa-icon"/></b-button>
							<b-button @click="showChilds(false)" class="form-control" variant="outline-secondary"><font-awesome-icon icon="eye-slash" class="fa-icon"/></b-button>
						</b-input-group>
					</b-button-toolbar>
					<div>
						<code class="lb val" v-if="infoOpen === 'value'">{{ content.value }}</code>
						<code class="lb" v-if="infoOpen === 'comment'"><ul><li v-for="comment in content.comments">{{ comment }}</li></ul></code>
					</div>
					<div v-if="content.childs.length > 0">
						<b>Kinder:</b><br>
						<ViewXmlObject2 ref="childs" :content="aContent" :key="aKey" v-for="(aContent, aKey) in content.childs"/>
					</div>
				</b-card-body>
			</b-collapse>
		</b-card>
	</div>

	<div class="error" v-else>
		Kein "object" übergeben !!!!
	</div>
</template>

<script>
	export default {
		name: 'ViewXmlObject2',
		props: {
			object: Object,
			content: Object,
		},
		data () {
			return {
				'isOpen': false,
				'errorsOpen': true,
				'processOpen': false,
				'valueOpen': false,
				'xmlOpen': false,
				'infoOpen': undefined,
			}
		},
		computed: {
			tranculatedValue () {
				var aVal = this.content.value
				if (aVal !== undefined) {
					return aVal.length > 25 ? aVal.slice(0, 25) + '...' : aVal
				} else {
					return ''
				}
			},
		},
		methods: {
			showChilds (state) {
				this.$refs.childs.forEach(function (c) {
					c.setIsOpen(state)
				})
			},
			setIsOpen (state) {
				this.isOpen = state
			},
			setInfoOpen (open) {
				this.infoOpen = ((this.infoOpen !== open) ? open : undefined)
			},
			length (val) {
				if (Array.isArray(val)) {
					return val.length
				} else {
					return Object.keys(val).length
				}
			},
		},
		created: function () {
			if (this.content !== undefined) {
				if (!this.content.parserIgnore) {
					this.isOpen = true
				}
			}
		}
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
	.obj > .obj {
		margin-left: 23px;
	}
	.item {
		border: 1px solid #ddd;
		margin-top: -1px;
		padding: 1px 6px;
		border-radius: 20px;
	}
	.item.danger {
		background: #fee;
	}
	.item > .title {
		margin-left: 5px;
		padding: 4px 12px;
		font-weight: bold;
	}
	.item > button {
		margin: 0px;
		padding: 0px;
		background: none;
		border: none;
		width: 17px;
	}
	.item > .icon ~ .icon {
		margin-left: 5px;
	}
	.item > .error {
		float: right;
		margin-left: 15px;
	}
	.item > .attributes {
		font-size: 11px;
		color: #eee;
		float: right;
		margin-top: 3px;
		margin-right: -3px;
	}
	.item > .attributes > .attr {
		background: #888;
		padding: 2px 6px;
		border-radius: 8px;
		margin-left: 1px;
	}
	.item > .attributes > .attr > i {
		font-style: normal;
		color: #666;
		background: #eee;
		margin-left: 5px;
		padding: 1px 6px 1px 4px;
		border-radius: 0px 10px 10px 0px;
		margin-right: -5px;
	}
	.item > .value {
	}
	.item > .value:before {
		content: "> ";
	}
	.add-item {
		background: #eef;
	}
	.add-item > button {
		width: 100%;
		text-align: left;
	}
	.item > button:not([disabled]), .add-item > button:not([disabled]) {
		cursor: pointer;
	}
	.item.comment-item {
		font-size: 12px;
		background: #eee;
	}
	.attribut {
		display: inline-block;
		color: #eee;
		background: #444;
		margin-left: 5px;
		font-size: 12px;
		line-height: 1.2;
		padding: 3px 6px 2px 8px;
		border-radius: 10px;
	}
	.attribut > span {
		background: #eee;
		color: #444;
		padding: 1px 5px;
		margin-right: 3px;
	}
</style>
