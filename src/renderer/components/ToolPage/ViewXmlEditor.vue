<template>
	<div class="start" v-if="xmlObj.t === 'start'">
		<ViewXmlEditor :xmlObj="xmlObjItem" v-for="(xmlObjItem, xmlObjKey) in xmlObj.c" :key="xmlObjKey"/>
	</div>
	<div class="obj" v-else>
		<div :class="{'item': true}">
			<div>
				<button  @click="isOpen = !isOpen" :class="'blank' + ((xmlObj.c) ? ((isOpen) ? ' minus' : ' plus') : '')" :disabled="!xmlObj.c"></button>
			</div>
			<div class="text" v-if="xmlObj.n === '#text'">
				<span :class="{'value': true, 'empty': !xmlObj.v}">{{ xmlObj.v }}</span>
			</div>
			<div class="tag" v-else>
				<span class="otag"><i>&lt;{{ xmlObj.n + ((xmlObj.a)? '' : '&gt;') }}</i>
					<span class="attributes" v-if="xmlObj.a">
						<span class="attr" v-for="(attr, attrKey) in xmlObj.a" :key="attrKey">&nbsp;<span class="attr-prop">{{ attrKey }}</span>="<span class="attr-val">{{ attr }}</span>"</span>
					</span>
					<i>{{ ((xmlObj.a)? '&gt;' : '') }}</i>
				</span>
				<span :class="{'value': true, 'empty': !xmlObj.v}" v-if="!xmlObj.c">{{ xmlObj.v }}</span>
				<ViewXmlEditor :xmlObj="xmlObjItem" v-for="(xmlObjItem, xmlObjKey) in xmlObj.c" :key="xmlObjKey" v-if="isOpen"/>
				<span class="ctag">&lt;/{{ xmlObj.n }}&gt;</span>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'ViewXmlEditor',
		props: {
			xmlObj: Object
		},
		data () {
			return {
				'isOpen': true
			}
		}
	}
</script>

<style scoped>
	.item {
		display: table;
	}
	.item > div {
		display: table-cell;
	}
	.item button.blank {
		margin: 0px 5px 0px 0px;
		padding: 0px;
		background: none;
		border: none;
		width: 15px;
		text-align: center;
	}
	.item button.blank.minus:before {
		content: "-";
	}
	.item button.blank.plus:before {
		content: "+";
	}
	.tag:hover>.otag, .tag:hover>.ctag {
		background: #eee;
	}
	.value.empty {
		background: #fee;
	}
	.value.empty:after {
		content: "...";
	}
	.value:hover {
		background: #eef;
	}
	.otag > i {
		font-style: normal;
	}
	.attr-prop:hover, .attr-val:hover {
		background: #eef;
	}
</style>
