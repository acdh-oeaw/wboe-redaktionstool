<template>
	<span :id="'xrlv' + content.uId" class="xrlvmodal">
		<button @click="edit=true" class="btn-none xrlvmodalbtn view">
			view
			<font-awesome-icon icon="external-link-alt"/>
		</button>
		<b-modal v-if="edit" ref="editmodal" :id="'xrlvmodal' + content.uId" title="Querverweis auf Artikel" @hidden="edit=false" @ok="saveValue" @hide="chancelValue">
			<p>xxxx</p>
		</b-modal>
	</span>
</template>

<script>
	// import _ from 'lodash'
	// import stdFunctions from '@/functions/stdFunctions'

	export default {
		name: 'XRlvModal',
		props: {
			content: Object,
		},
		data () {
			return {
				'edit': false,
				'changed': false,
			}
		},
		computed: {
		},
		watch: {
			'edit' (nVal) {
				if (nVal) {
					this.$nextTick(() => {
						this.$refs.editmodal.show()
					})
				}
			},
			'refreshSelect' (nVal) {
				if (nVal) {
					this.$nextTick(() => {
						this.refreshSelect = false
					})
				}
			},
		},
		mounted () {
			console.log('XRlvModal', this.content)
		},
		methods: {
			saveValue () {
				// ToDo: Speichervorgang
				this.changed = false
			},
			chancelValue (e) {
				if (!this.changed || confirm('Änderung verwerfen?')) {
					this.changed = false
				} else {
					e.preventDefault()
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
	.xrlvmodalbtn.view {
		cursor: pointer;
	}
	.xrlvmodal > div, .xrlvmodal > div > div {
		display:inline-block;
	}
</style>
