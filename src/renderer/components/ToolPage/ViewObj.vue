<template>
	<div class="start" v-if="xmlObj.t === 'start'">
		<ViewObj :xmlObj="xmlObjItem" v-for="(xmlObjItem, xmlObjKey) in xmlObj.c" :key="xmlObjKey" :nextNodeName="((xmlObj.c[xmlObjKey + 1]) ? xmlObj.c[xmlObjKey + 1].n : undefined)"/>
	</div>
	<div class="obj" v-else>
		<div :class="{'item': true, 'text-danger danger': Array.isArray(xmlObj.e)}">
			<button  @click="isOpen = !isOpen" :disabled="!xmlObj.c" class="icon"><span :class="'glyphicon ' + ((xmlObj.c) ? ((isOpen) ? 'glyphicon-triangle-bottom' : 'glyphicon-triangle-right') : 'glyphicon-menu-right')" aria-hidden="true"></span></button>
			<span class="glyphicon glyphicon-minus icon" aria-hidden="true" v-if="xmlObj.o && xmlObj.o.value && xmlObj.o.value.indexOf('edit') > -1"></span>
			<span class="glyphicon glyphicon-lock icon" aria-hidden="true" v-else></span>
			<span class="title"><span class="glyphicon glyphicon-font" aria-hidden="true" v-if="xmlObj.n === '#text'"></span>{{ ((xmlObj.n === '#text') ? '' : xmlObj.n) }}</span>
			<span class="value" v-if="xmlObj.v">{{ xmlObj.v }}</span>
			<span class="glyphicon glyphicon-pencil mil5" aria-hidden="true" v-if="xmlObj.o && xmlObj.o.value && xmlObj.o.value.indexOf('edit') > -1"></span>
			<span class="error" v-if="Array.isArray(xmlObj.e)" :title="xmlObjError"><span class="glyphicon glyphicon-warning-sign" aria-hidden="true"></span></span>
			<span class="attributes" v-if="xmlObj.a">
				<span class="attr" v-for="(attr, attrKey) in xmlObj.a" :key="attrKey">{{ attrKey }}<i>{{ attr }}</i></span>
			</span>
		</div>
		<ViewObj :xmlObj="xmlObjItem" v-for="(xmlObjItem, xmlObjKey) in xmlObj.c" :key="xmlObjKey" :nextNodeName="((xmlObj.c[xmlObjKey + 1]) ? xmlObj.c[xmlObjKey + 1].n : undefined)" v-if="isOpen"/>
		<div class="item add-item" v-if="xmlObj.n !== nextNodeName && xmlObj.o && xmlObj.add">
			<button><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
				<span v-if="xmlObj.o.tagAddTitle"><b> {{ xmlObj.o.tagAddTitle }}</b></span>
				<span v-else><b> "{{ xmlObj.n }}" hinzufügen</b></span>
			</button>
		</div>
	</div>

</template>

<script>
	export default {
		name: 'ViewObj',
		props: {
			xmlObj: Object,
			nextNodeName: String
		},
		data () {
			return {
				'isOpen': true
			}
		},
		computed: {
			xmlObjError: function () {
				return ((Array.isArray(this.xmlObj.e)) ? this.xmlObj.e.join('\n') : undefined)
			}
		}
	}
</script>

<style scoped>
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
	.item .glyphicon {
		top: 2px;
	}
	.item > button {
		margin: 0px;
		padding: 0px;
		background: none;
		border: none;
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
</style>
