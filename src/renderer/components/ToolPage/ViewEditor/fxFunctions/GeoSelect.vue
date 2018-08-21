<template>
	<span v-if="!refreshSelect">
		<span class="geoselect edit" v-if="edit">
			GeoSelect Edit
			<button @click="setValue" class="btn-none fx-btn"><font-awesome-icon icon="check" class="text-success"/></button>
			<button @click="chancelValue" class="btn-none fx-btn"><font-awesome-icon icon="times" class="text-danger"/></button>
		</span>
		<button @click="edit = true" class="btn-none geoselect view" v-else>
			<span v-for="(place, pKey) in places"><template v-if="pKey > 0">, </template><span class="place">{{ place.orgXmlObj.getValue(false) }}</span></span>
			<!-- leere Spans für die Kinder damit die Warnungen zugeordnet werden können!  -->
			<span :id="'eo' + child.uId" v-for="child in content.childs">
				<span class="error-place" v-if="Object.keys(child.warnings).length > 0 || Object.keys(child.errors).length > 0">{{ child.orgXmlObj.getValueByOption(child.parserObj.options.get('value'), false) }}&nbsp;</span>
				<font-awesome-icon icon="exclamation-triangle" class="text-warning" v-if="Object.keys(child.warnings).length > 0 || Object.keys(child.errors).length > 0"/>
			</span>
			<font-awesome-icon icon="map-marked"/>
		</button>
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
			'places' () {
				let aPlaces = []
				this.content.getChilds('all', true).forEach(function (child) {
					if (child.orgXmlObj.name === 'placeName' && child.orgXmlObj.getValue(false)) {
						aPlaces.push(child)
					}
				}, this)
				return aPlaces
			},
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
	button.fx-btn {
		width: 25px;
		margin-left: 3px;
		text-align: center;
	}
	button.fx-btn:hover, button.fx-btn:focus {
		background: #bbb !important;
	}
</style>
