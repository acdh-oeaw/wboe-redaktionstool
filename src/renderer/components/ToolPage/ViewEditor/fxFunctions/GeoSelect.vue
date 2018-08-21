<template>
	<span v-if="!refreshSelect">
		<span class="geoselect edit" v-if="edit">
			GeoSelect Edit
			<font-awesome-icon @click="setValue" icon="check" class="text-success"/>
			<font-awesome-icon @click="chancelValue" icon="times" class="text-danger"/>
		</span>
		<span @click="edit = true" class="geoselect view" v-else>
			GeoSelect View
			<!-- leere Spans für die Kinder damit die Warnungen zugeordnet werden können!  -->
			<span :id="'eo' + child.uId" v-for="child in content.childs">
				<span class="error-place" v-if="Object.keys(child.warnings).length > 0 || Object.keys(child.errors).length > 0">{{ child.orgXmlObj.getValueByOption(child.parserObj.options.get('value'), false) }}&nbsp;</span>
				<font-awesome-icon icon="exclamation-triangle" class="text-warning" v-if="Object.keys(child.warnings).length > 0 || Object.keys(child.errors).length > 0"/>
			</span>
			<font-awesome-icon icon="map-marked"/>
		</span>
	</span>
</template>

<script>
	import SelectPossibleValues from '../SelectPossibleValues'
	// import stdFunctions from '@/functions/stdFunctions'

	export default {
		name: 'GeoSelect',
		props: {
			content: Object,
		},
		data () {
			return {
				'refreshSelect': false,
				'edit': false,
				'changed': false,
			}
		},
		computed: {
		},
		watch: {
			'refreshSelect' (nVal) {
				if (nVal) {
					this.$nextTick(() => {
						this.refreshSelect = false
					})
				}
			},
		},
		mounted () {
		},
		methods: {
			setValue () {
				// ToDo!!!!
				this.edit = false
			},
			chancelValue () {
				if (!this.changed || confirm('Änderung verwerfen?')) {
					this.edit = false
				}
			},
		},
		components: {
			SelectPossibleValues
		},
	}
</script>

<style scoped>
	.geoselect.view {
		cursor: pointer;
	}
	span.warning {
		background: #fff4b9;
	}
	span.error-place {
		padding: 0 5px;
		background: #ee6;
		display: inline-block;
	}
</style>
