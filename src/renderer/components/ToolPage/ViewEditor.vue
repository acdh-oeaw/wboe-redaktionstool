<template>
	<div class="start" v-if="xmlObj.t === 'start'">
		<ViewEditor :xmlObj="xmlObjItem" :showComment="showComment" :showAdd="showAdd" v-for="(xmlObjItem, xmlObjKey) in xmlObj.c" :key="xmlObjKey" :nextNodeName="((xmlObj.c[xmlObjKey + 1]) ? xmlObj.c[xmlObjKey + 1].n : undefined)"/>
	</div>
	<div class="editor" v-else>

		<!-- <div :class="'item' + ((Array.isArray(xmlObj.e)) ? ' text-danger danger' : '') + ((xmlObj.n === '#comment') ? ' comment-item' : '')" v-if="xmlObj.n !== '#comment' || showComment">
			<button  @click="isOpen = !isOpen" :disabled="!xmlObj.c">
				<font-awesome-icon :icon="((xmlObj.c) ? ((isOpen) ? 'caret-down' : 'caret-right') : 'angle-right')"/>
			</button>
			<font-awesome-icon :icon="'lock' + ((xmlObj.o && xmlObj.o.value && xmlObj.o.value.indexOf('edit') > -1) ? '-open' : '')"/>
			<span class="title">
				<font-awesome-icon :icon="((xmlObj.n === '#text') ? 'font' : ((xmlObj.n === '#comment')? 'comment' : ''))" v-if="xmlObj.n === '#text' || xmlObj.n === '#comment'"/>
				<span>{{ ((xmlObj.n === '#text' || xmlObj.n === '#comment') ? '' : xmlObj.n) }}</span>
			</span>
			<span class="value" v-if="xmlObj.v">{{ xmlObj.v }}</span>
			<font-awesome-icon icon="edit" v-if="xmlObj.o && xmlObj.o.value && xmlObj.o.value.indexOf('edit') > -1"/>
			<span class="error" v-if="Array.isArray(xmlObj.e)" :title="xmlObjError"><font-awesome-icon icon="exclamation-triangle"/></span>
			<span class="attributes" v-if="xmlObj.a">
				<span class="attr" v-for="(attr, attrKey) in xmlObj.a" :key="attrKey">{{ attrKey }}<i>{{ attr }}</i></span>
			</span>
		</div>
		<ViewEditor :xmlObj="xmlObjItem" :showComment="showComment" :showAdd="showAdd" v-for="(xmlObjItem, xmlObjKey) in xmlObj.c" :key="xmlObjKey" :nextNodeName="((xmlObj.c[xmlObjKey + 1]) ? xmlObj.c[xmlObjKey + 1].n : undefined)" v-if="isOpen"/>
		<div class="item add-item" v-if="showAdd && xmlObj.n !== nextNodeName && xmlObj.o && xmlObj.add">
			<button><font-awesome-icon icon="plus"/>
				<span v-if="xmlObj.o.tagAddTitle"><b> {{ xmlObj.o.tagAddTitle }}</b></span>
				<span v-else><b> "{{ xmlObj.n }}" hinzufügen</b></span>
			</button>
		</div> -->
	</div>

</template>

<script>
	export default {
		name: 'ViewEditor',
		props: {
			xmlObj: Object,
			nextNodeName: String,
			showComment: Boolean,
			showAdd: Boolean
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
</style>
