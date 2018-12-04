<template>
	<span :id="'xrlv' + content.uId" class="xrlvmodal">
		<button @click="edit = true" class="btn-none xrlvmodalbtn view">
			<PreviewContent :content="content"/>
			<font-awesome-icon icon="external-link-alt"/>
		</button>
		<b-modal v-if="edit" ref="editmodal" :id="'xrlvmodal' + content.uId" title="Querverweis auf Artikel" @hidden="edit = false" @hide="chancelValue" size="lg" modal-class="modal-xl">
			<div class="row">
				<div class="col-5">
					<div class="card fileselect">
  					<div class="card-body">
							<div class="input-group mb-3">
								<input type="text" class="form-control" v-model="search">
								<div class="input-group-append">
									<button class="btn btn-primary" type="button" @click="debouncedSearching"><font-awesome-icon icon="search"/></button>
								</div>
							</div>
							<button @click="selFile = ''" :class="'btn btn-sm w-100 mb-1 text-left btn-' + ((!selFile) ? 'success' : 'primary')">{{ cFile }}<span class="float-right"><b>(Diese Datei)</b></span></button>
							<button @click="selFile = aFile.file"
															:class="'btn btn-sm w-100 mb-1 text-left btn-' + ((selFile === aFile.file) ? 'success' : ((aFile.loaded) ? 'primary' : 'secondary'))"
															v-if="aFile.show || selFile === aFile.file"
															:key="'fl' + aKey"
															v-for="(aFile, aKey) in filelist">
								{{ aFile.file }}
								<span class="float-right">
									{{
										((aFile.errors > 0 ) ? aFile.errors + ' F' : '')
										+ ((aFile.warnings > 0 ) ? ((aFile.errors > 0) ? ', ' : '') + aFile.warnings + ' W' : '')
										+ ((aFile.changed > 0 ) ? ((aFile.errors > 0 || aFile.warnings > 0) ? ' ,'  : '') + 'A' : '')
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
				<div class="form-row align-items-center">
					<div class="col-1">
						<div class="input-group mb-2">
							<input type="text" class="form-control" placeholder="lbl">
						</div>
					</div>
					<div class="col-2">
						<div class="input-group mb-2">
							<div class="input-group-prepend">
								<div class="input-group-text">Text</div>
							</div>
							<input type="text" class="form-control" v-model="txtAnchor">
						</div>
					</div>
					<div class="col-2">
						<div class="input-group mb-2">
							<div class="input-group-prepend">
								<div class="input-group-text">Datei</div>
							</div>
							<input type="text" class="form-control" v-model="selFile" placeholder="Diese Datei">
						</div>
					</div>
					<div class="col-2">
						<div class="input-group mb-2">
							<div class="input-group-prepend">
								<div class="input-group-text">#</div>
							</div>
							<input type="text" class="form-control" v-model="valAnchor">
						</div>
					</div>
					<div class="col-3">
						<div class="input-group mb-2">
							<div class="input-group-prepend">
								<div class="input-group-text">@</div>
							</div>
							<select class="form-control" v-model="typAnchor">
								<option value="lemma">lemma</option>
								<option value="variant">variant</option>
							</select>
							<select class="form-control input-group-append" v-model="subTypAnchor">
								<option value="">Kein Subtype</option>
								<option value="compound">compound</option>
								<option value="MWE">MWE</option>
								<option value="diminutive">diminutive</option>
								<option value="movierung">movierung</option>
								<option value="shortform">shortform</option>
							</select>
						</div>
					</div>
					<div class="col-2">
						<button type="button" @click="saveValue(); $refs.editmodal.hide();" class="btn btn-primary float-right ml-2 mb-2">OK</button>
						<button type="button" @click="$refs.editmodal.hide()" class="btn btn-secondary float-right mb-2">Cancel</button>
					</div>
				</div>
			</div>
		</b-modal>
	</span>
</template>

<script>
	import { remote } from 'electron'
	import { mapState } from 'vuex'
	import ViewPreview from '../../ViewPreview'
	import PreviewContent from '../../ViewPreview/PreviewContent'
	import _ from 'lodash'
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
				'selFileEditObj': null,
				'search': '',
				'txtAnchor': '',
				'valAnchor': '',
				'typAnchor': '',
				'subTypAnchor': '',
			}
		},
		computed: {
			...mapState(['Parser']),
			...mapState(['Files']),
		},
		watch: {
			'search' (nVal) {
				this.debouncedSearching()
			},
			'selFile' (nVal) {
				this.selFileEditObj = null
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
				this.txtAnchor = aAnchor[0]
				this.valAnchor = aAnchor[1]
				this.typAnchor = aAnchor[2]
				this.subTypAnchor = aAnchor[3]
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
								this.filelist.push({ 'file': file, 'fullFileName': aFullFileName, 'searchval': file.substr(0, file.length - 4).toLowerCase(), 'anchors': [], 'show': true, 'errors': 0, 'warnings': 0, 'changed': false, 'loaded': false })
							}
						}
					}, this)
				}
				this.debouncedSearching()
			},
			debouncedSearching: _.debounce(function () {		// Verzögert suchen
				if (this.search.trim().length < 1) {
					this.filelist.forEach(function (aFile) {
						aFile.show = true
					}, this)
				} else {
					this.filelist.forEach(function (aFile) {
						aFile.show = (aFile.file.indexOf(this.search.trim().toLowerCase()) > -1)
					}, this)
				}
			}, 250),
		},
		created () {
		},
		beforeDestroy () {
		},
		components: {
			ViewPreview,
			PreviewContent,
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
