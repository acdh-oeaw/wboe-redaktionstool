<template>
	<span :id="'xrlv' + content.uId" class="xrlvmodal">
		<button @click="edit = true" class="btn-none xrlvmodalbtn view">
			view
			<font-awesome-icon icon="external-link-alt"/>
		</button>
		<b-modal v-if="edit" ref="editmodal" :id="'xrlvmodal' + content.uId" title="Querverweis auf Artikel" @hidden="edit = false" @hide="chancelValue" size="lg">
			<div class="row">
				<div class="col-5">
					<div class="card fileselect">
  					<div class="card-body">
							<button @click="selFile = ''" :class="'btn btn-sm w-100 mb-1 text-left btn-' + ((!selFile) ? 'success' : 'primary')">{{ cFile }} (Diese Datei)</button>
							<button @click="selFile = aFile.file" :class="'btn btn-sm w-100 mb-1 text-left btn-' + ((selFile === aFile.file) ? 'success' : ((aFile.loaded) ? 'primary' : 'secondary'))" :key="'fl' + aKey" v-for="(aFile, aKey) in filelist">
								{{ aFile.file }}
								<span class="float-right">
									{{
										((aFile.errors > 0 ) ? aFile.errors + ' F' : '')
										+ ((aFile.warnings > 0 ) ? ((aFile.errors > 0) ? ', ' : '') + aFile.warnings + ' W' : '')
										+ ((aFile.changed > 0 ) ? ((aFile.errors > 0 || aFile.warnings > 0) ? ' ,'  : '') + 'C' : '')
									}}
								</span>
							</button>
						</div>
					</div>
				</div>
				<div class="col-7">
					<div class="card anchorselect">
  					<div class="card-body">
							<ViewPreview :start="true" :showAnchors="true" :selectableAnchors="true" @setAnchor="setAnchor" :object="selFileEditObj" v-if="selFileEditObj && selFileEditObj.contentObj"/>
						</div>
					</div>
				</div>
			</div>
			<div slot="modal-footer" class="w-100">
         <p class="my-2 float-left">{{ selFile }}</p>
				 <button type="button" @click="saveValue(); $refs.editmodal.hide();" class="btn btn-primary float-right ml-2">OK</button>
				 <button type="button" @click="$refs.editmodal.hide()" class="btn btn-secondary float-right">Cancel</button>
			</div>
		</b-modal>
	</span>
</template>

<script>
	import { remote } from 'electron'
	import { mapState } from 'vuex'
	import ViewPreview from '../../ViewPreview'
	// import _ from 'lodash'
	// import stdFunctions from '@/functions/stdFunctions'
	import XmlObject from '@/functions/xml/Xml'
	import EditorObject from '@/functions/editor/Editor'
	import fPath from 'path'
	const fs = remote.require('fs')

	export default {
		name: 'XRlvModal',
		props: {
			content: Object,
		},
		data () {
			return {
				'edit': false,
				'changed': false,
				'filelist': [],
				'cFile': '',
				'selFile': '',
				'selFileEditObj': null
			}
		},
		computed: {
			...mapState(['Parser']),
			...mapState(['Files']),
		},
		watch: {
			'selFile' (nVal) {
				if (!nVal) {
					this.selFileEditObj = this.content.root
				} else {
					let aFile = null
					this.filelist.some(function (af, i) {
						if (af.file === this.selFile) {
							aFile = af
							return true
						}
					}, this)
					if (aFile) {
						let aFileContent = fs.readFileSync(aFile.fullFileName, 'utf8').replace(/\r/gmi, '')
						this.selFileEditObj = new EditorObject.EditorBase(this.Parser.parser, new XmlObject.XmlBase(aFileContent))
						this.$set(aFile, 'errors', Object.keys(this.selFileEditObj.errors).length)
						this.$set(aFile, 'warnings', Object.keys(this.selFileEditObj.warnings).length)
						this.$set(aFile, 'changed', (this.selFileEditObj.getXML() !== aFileContent))
						this.$set(aFile, 'loaded', true)
					}
				}
			},
			'edit' (nVal) {
				if (nVal) {
					this.getBaseData()
					this.updateFileList()
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
			this.cFile = this.Files.file.substr(this.Files.file.length - this.Files.file.split('\\').pop().split('/').pop().length)
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
			setAnchor (aAnchor) {
				// ToDo ...
				console.log(aAnchor)
			},
			getBaseData () {
				// ToDo ...
				this.selFile = ''
				this.selFileEditObj = this.content.root
			},
			updateFileList () {
				this.filelist = []
				if (this.Files.file) {
					let aPath = this.Files.file.substr(0, this.Files.file.length - this.Files.file.split('\\').pop().split('/').pop().length)
					fs.readdirSync(aPath).forEach(function (file) {
						let aFullFileName = fPath.join(aPath, file)
						if (!fs.statSync(aFullFileName).isDirectory()) {
							let aExt = file.split('.').pop()
							if (aExt === 'xml' && file.substr(0, 6) !== 'parser' && file !== this.cFile) {
								this.filelist.push({ 'file': file, 'fullFileName': aFullFileName, 'title': null, 'anchors': [], 'show': true, 'errors': 0, 'warnings': 0, 'changed': false, 'loaded': false })
							}
						}
					}, this)
				}
			},
		},
		created () {
		},
		beforeDestroy () {
		},
		components: {
			ViewPreview,
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
	.fileselect, .anchorselect {
		height: calc( 100vh - 240px );
		min-height: 300px;
		overflow-y: auto;
	}
	.btn-sm {
		font-size: 0.875rem;
	}
</style>
