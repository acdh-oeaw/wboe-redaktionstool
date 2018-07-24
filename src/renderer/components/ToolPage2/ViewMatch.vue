<template>
	<div class="start" v-if="content === undefined && object !== undefined">
		<b-card header="Errors" no-body class="mib20 paneldecent" border-variant="danger" header-bg-variant="danger" v-if="object.errors && object.errors.length > 0">
			<div slot="header"><button v-b-toggle="'collapse-error'" class="header-btn-toggle" style="color: #fff;"><b>Errors ({{ object.errors.length }})</b><font-awesome-icon :icon="((errorsOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/></button></div>
			<b-collapse v-model="errorsOpen" id="collapse-error">
				<b-card-body>
					<div class="g-errors">
						<dl class="mi0 pl20 dots">
							<template  v-for="error in object.errors">
								<dt><span v-for="node in error.tree" class="tree">{{ node }}</span></dt>
								<dd v-if="Array.isArray(error.error)">
									<ul>
										<li v-for="err in error.error">{{ err }}</li>
									</ul>
								</dd>
								<dd v-else>{{ error.error }}</dd>
							</template>
						</dl>
					</div>
				</b-card-body>
			</b-collapse>
		</b-card>
		<div v-if="object.content">
			<ViewXmlObject :content="aContent" :key="aKey" v-for="(aContent, aKey) in object.content"/>
		</div>
		<div v-else>
			Keine Content-Daten vorhanden
		</div>
	</div>

	<div class="obj" v-else-if="content !== undefined">
		<b-card :header="content.n" no-body :class="{'mib10': true, 'paneldecent': true, 'invert': headerVariante !== 'Default'}" :border-variant="headerVariante" :header-bg-variant="headerVariante">
			<div slot="header">
				<button v-b-toggle="'collapse-' + _uid" class="header-btn-toggle" :style="'color: ' + pHeaderColor + ';'">
					<font-awesome-icon icon="question-circle" class="fa-icon icmd mir5" v-if="!content.parser || content.parser.n === '#unknowen'"/>
					<span><b>{{ content.n }}</b></span>
					<span class="val" v-if="content.v"> = <i>{{ tranculatedValue }}</i></span>
					<span class="attribut" v-for="(attrOpt, attr) in getValOfSubProp(content, 'p.options.attributes')">
						{{ attr + ((attrOpt.value) ? ':' : '') }}
						<span v-if="attrOpt.value">{{ attrOpt.value }}</span>
					</span>
					<font-awesome-icon :icon="((isOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/>
					<font-awesome-icon icon="exclamation-triangle" class="float-right fa-icon mir5" style="color: #d33;" v-if="content.errors"/>
				</button>
			</div>
			<b-collapse v-model="isOpen" :id="'collapse-' + _uid">
				<b-card-body>
					<div v-if="content.errors">
						<b>Fehler:</b><br>
						<ul style="color: #d33">
							<li v-for="error in content.errors">{{ error }}</li>
						</ul>
					</div>
					<div v-if="content.parser">
						<button @click="parserOpen = !parserOpen" class="btn-none"><b>Parser{{ ((parserOpen) ? ':' : '') }}</b> <font-awesome-icon :icon="((parserOpen) ? 'eye' : 'eye-slash')" class="fa-icon mil5"/></button><br>
						<code class="lb" v-if="parserOpen">{{ content.parser }}</code>
					</div>
					<div v-if="content.v">
						<button @click="valueOpen = !valueOpen" class="btn-none"><b>Value{{ ((valueOpen) ? ':' : '') }}</b> <font-awesome-icon :icon="((valueOpen) ? 'eye' : 'eye-slash')" class="fa-icon mil5"/></button><br>
						<code class="lb val" v-if="valueOpen">{{ content.v }}</code>
					</div>
					<div v-if="content.xml">
						<button @click="xmlOpen = !xmlOpen" class="btn-none"><b>HTML{{ ((xmlOpen) ? ':' : '') }}</b> <font-awesome-icon :icon="((xmlOpen) ? 'eye' : 'eye-slash')" class="fa-icon mil5"/></button><br>
						<code class="lb val" v-if="xmlOpen">{{ content.xml }}</code>
					</div>
					<div v-if="content.p">
						<button @click="processOpen = !processOpen" class="btn-none"><b>Process{{ ((processOpen) ? ':' : '') }}</b> <font-awesome-icon :icon="((processOpen) ? 'eye' : 'eye-slash')" class="fa-icon mil5"/></button><br>
						<code class="lb" v-if="processOpen">{{ content.p }}</code>
					</div>
					<div v-if="content.c">
						<b>Kinder:</b><br>
						<ViewXmlObject :content="aContent" :key="aKey" v-for="(aContent, aKey) in content.c"/>
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
		name: 'ViewXmlObject',
		props: {
			object: Object,
			content: Object,
		},
		data () {
			return {
				'isOpen': true,
				'errorsOpen': true,
				'parserOpen': false,
				'processOpen': false,
				'valueOpen': false,
				'xmlOpen': false,
				'pHeaderColor': '#333',
			}
		},
		computed: {
			headerVariante () {
				if (this.content.errors) {
					this.pHeaderColor = '#eee'
					return 'danger'
				}
				if (!this.content.parser || this.content.parser.n === '#unknowen') {
					this.pHeaderColor = '#eee'
					return 'secondary'
				}
				return 'Default'
			},
			tranculatedValue () {
				var aVal = this.content.v
				if (aVal !== undefined) {
					return aVal.length > 25 ? aVal.slice(0, 25) + '...' : aVal
				} else {
					return ''
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
	.invert > .card-header .val > i {
		color: #ccf;
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
	div.g-errors {
		max-height: calc( 70vh - 200px );
		overflow: auto;
		padding: 8px 10px;
		margin: -8px;
	}
</style>
