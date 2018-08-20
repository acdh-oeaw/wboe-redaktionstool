<template>
	<span>
		<span v-if="edit">
			{{ grossregionVal['Großregion'] }}, {{ bundeslandVal['Bundesland'] }} -
			GeoVerbreitung Edit
		</span>
		<span v-else>
			<span v-if="grossregionVal" :class="{'warning': !grossregionVal['Großregion']}">{{ (grossregionVal['Großregion'] || grossregionVal) + ((bundeslandVal) ? ', ' : '') }}</span>
			<span v-if="bundeslandVal" :class="{'warning': !bundeslandVal['Bundesland']}">{{ bundeslandVal['Bundesland'] || bundeslandVal }}</span>
		</span>
		<!-- leere Spans für die Kinder damit die Warnungen zugeordnet werden können!  -->
		<span :id="'eo' + child.uId" v-for="child in content.childs"><font-awesome-icon icon="exclamation-triangle" class="text-warning" v-if="Object.keys(child.warnings).length > 0 || Object.keys(child.errors).length > 0"/></span>
	</span>
</template>

<script>
	import SelectPossibleValues from '../SelectPossibleValues'
	import stdFunctions from '@/functions/stdFunctions'

	export default {
		name: 'GeoVerbreitung',
		props: {
			content: Object,
		},
		data () {
			return {
				'refreshSelect': false,
				'edit': false,
			}
		},
		computed: {
			'placeParser' () {		// Aktuellen Parser für "placeName" ermitteln
				let pParser = null
				this.content.parserObj.childs.some(function (aPar) {
					if (aPar.name === 'placeName') {
						pParser = aPar
						return true
					}
				}, this)
				return pParser
			},
			'grossregionEObj' () {
				let aGrossregion = null
				let delList = []
				this.content.getChilds('all', true).forEach(function (aChild) {
					if (aChild.parserObj === this.placeParser && (aChild.orgXmlObj.attributes && (aChild.orgXmlObj.attributes.type === 'grossregion' || aChild.orgXmlObj.attributes.type === 'bundesland'))) {
						if (aChild.orgXmlObj.attributes.type === 'grossregion') {
							aGrossregion = aChild
						}
					} else {
						delList.push(aChild)
					}
				}, this)
				if (delList.length > 0) {
					delList.forEach(function (aDel) {
						aDel.delete(true)
					}, this)
					this.content.updateData(true)
				}
				return aGrossregion
			},
			'bundeslandEObj' () {
				let aBundesland = null
				let delList = []
				this.content.getChilds('all', true).forEach(function (aChild) {
					if (aChild.parserObj === this.placeParser && (aChild.orgXmlObj.attributes && (aChild.orgXmlObj.attributes.type === 'grossregion' || aChild.orgXmlObj.attributes.type === 'bundesland'))) {
						if (aChild.orgXmlObj.attributes.type === 'bundesland') {
							aBundesland = aChild
						}
					} else {
						delList.push(aChild)
					}
				}, this)
				if (delList.length > 0) {
					delList.forEach(function (aDel) {
						aDel.delete(true)
					}, this)
					this.content.updateData(true)
				}
				if (!aBundesland && this.grossregionEObj && this.grossregionVal['BundeslandObj']) {
					aBundesland = this.content.add(null, this.placeParser)
					aBundesland.orgXmlObj.setAttribute('type', 'bundesland')
					aBundesland.orgXmlObj.setAttribute('xml:id', this.grossregionVal['BundeslandObj']['Sigle_DB'])
					aBundesland.orgXmlObj.setValue(this.grossregionVal['BundeslandObj']['Bundesland'])
					this.content.updateData(true)
				}
				return aBundesland
			},
			'grossregionVal' () {
				if (this.grossregionEObj) {
					if (this.grossregionEObj.orgXmlObj.attributes && this.grossregionEObj.orgXmlObj.attributes['xml:id']) {
						let iVal = stdFunctions.getFirstKeyOfValueInPropertyOfArray(this.placeList['Großregion'], 'Sigle_DB', this.grossregionEObj.orgXmlObj.attributes['xml:id'])
						if (iVal > -1) {
							return this.placeList['Großregion'][iVal]
						}
					}
					let xVal = this.grossregionEObj.orgXmlObj.getValue(false)
					let iVal = stdFunctions.getFirstKeyOfValueInPropertyOfArray(this.placeList['Großregion'], 'Großregion', xVal)
					if (iVal > -1) {
						this.grossregionEObj.orgXmlObj.setAttribute('xml:id', this.placeList['Großregion'][iVal].Sigle_DB)
						return this.placeList['Großregion'][iVal]
					} else {
						return xVal
					}
				}
				return null
			},
			'bundeslandVal' () {
				if (this.bundeslandEObj) {
					if (this.bundeslandEObj.orgXmlObj.attributes && this.bundeslandEObj.orgXmlObj.attributes['xml:id']) {
						let iVal = stdFunctions.getFirstKeyOfValueInPropertyOfArray(this.placeList['Bundesland'], 'Sigle_DB', this.bundeslandEObj.orgXmlObj.attributes['xml:id'])
						if (iVal > -1) {
							return this.placeList['Bundesland'][iVal]
						}
					}
					let xVal = this.bundeslandEObj.orgXmlObj.getValue(false)
					let iVal = stdFunctions.getFirstKeyOfValueInPropertyOfArray(this.placeList['Bundesland'], 'Bundesland', xVal)
					if (iVal > -1) {
						this.bundeslandEObj.orgXmlObj.setAttribute('xml:id', this.placeList['Bundesland'][iVal].Sigle_DB)
						return this.placeList['Bundesland'][iVal]
					} else {
						return xVal
					}
				}
				return null
			},
			'placeList' () {
				return this.content.parserObj.root.additionalFiles[this.content.parserObj.options.get('editor.fxFunction.filename')].geoVerbreitung
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
			// console.log('placeList', this.placeList)
			// console.log('placeParser', this.placeParser)
			// console.log('grossregionEObj', this.grossregionEObj)
			// console.log('bundeslandEObj', this.bundeslandEObj)
			// console.log('grossregionVal', this.grossregionVal)
			// console.log('bundeslandVal', this.bundeslandVal)
		},
		methods: {
		},
		components: {
			SelectPossibleValues
		},
	}
</script>

<style scoped>
	span.warning {
		background: #fff4b9;
	}
</style>
