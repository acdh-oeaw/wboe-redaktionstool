<template>
	<span :id="'xrlv' + content.uId">
		<span v-if="!refreshSelect">
			<span class="xrlvxelect edit" v-if="edit">
				edit
				<button @click="saveValue" class="btn-none fx-btn"><font-awesome-icon icon="check" class="text-success"/></button>
				<button @click="chancelValue" class="btn-none fx-btn"><font-awesome-icon icon="times" class="text-danger"/></button>
			</span>
			<button @click="edit = true" class="btn-none xrlvxelect view" v-else>
				view
				<font-awesome-icon icon="external-link-alt"/>
			</button>
		</span>
		modal
	</span>
</template>

<script>
	// import _ from 'lodash'
	// import stdFunctions from '@/functions/stdFunctions'

	export default {
		name: 'XRlvSelect',
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
			console.log('XRlvSelect', this.content)
		},
		methods: {
			saveValue () {
				// ToDo: Speichervorgang
				this.edit = false
				this.refreshSelect = true
				this.changed = false
			},
			chancelValue () {
				if (!this.changed || confirm('Änderung verwerfen?')) {
					this.edit = false
					this.refreshSelect = true
					this.changed = false
				}
			},
		},
		created () {
		},
		beforeDestroy () {
		},
		components: {
		},
	}
</script>

<style scoped>
	.xrlvxelect.view {
		cursor: pointer;
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
