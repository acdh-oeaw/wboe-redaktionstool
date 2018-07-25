<template>
	<div class="tool-page">
		<b-button-toolbar class="main-toolbar">
			<b-dropdown size="sm" class="mx-1" right text="Developer - Datei" v-if="devMode">
				<b-dropdown-item @click="updateData()"><b>Parser und Datei neu laden</b></b-dropdown-item>
				<b-dropdown-divider></b-dropdown-divider>
				<b-dropdown-item @click="devSelectFile(aFile.fullFileName)" :active="aFile.fullFileName === Files.file" :key="aKey" v-for="(aFile, aKey) in devFiles">{{ aFile.file }}</b-dropdown-item>
			</b-dropdown>
			<b-button-group size="sm" class="mx-1" v-if="devMode">
				<b-btn @click="devNextFile(false)" title="Vorherige Datei"><font-awesome-icon icon="angle-left"/></b-btn>
				<b-btn @click="updateData()" title="Parser und Datei neu laden"><font-awesome-icon icon="sync-alt"/></b-btn>
				<b-btn @click="devNextFile()" title="Nächste Datei"><font-awesome-icon icon="angle-right"/></b-btn>
			</b-button-group>
			<b-input-group size="sm" class="w-25 mx-1" prepend="Datei">
				<p class="form-control file-name">{{ Files.file }}</p>
				<b-input-group-append>
					<b-btn @click="showFile()" variant="outline-secondary" title="Ordner in Explorer öffnen"><font-awesome-icon icon="external-link-alt"/></b-btn>
				</b-input-group-append>
			</b-input-group>
			<b-button-group size="sm" class="mr-1 mil-auto">
				<b-btn title="" v-b-tooltip.hover.html><font-awesome-icon icon="clipboard-check"/></b-btn>
			</b-button-group>
		</b-button-toolbar>
		<b-tabs v-model="aTab" content-class="tabc" nav-class="rel">
			<b-tab title="Editor">
				<div class="vieweditor scroll p20" v-if="aTab === 0">
					<ViewEditor :parser="Parser.parser" v-if="Parser.parser && Parser.parser.content"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>parser</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="Vorschau">
			</b-tab>
			<b-tab title="Objekt">
			</b-tab>
			<b-tab title="XML" :title-item-class="{'professional': true, 'hidden': !Options.show.professional}">
				<div class="viewxml scroll p20" v-if="aTab === 3 && Options.show.professional">
				</div>
			</b-tab>
			<b-tab title="Parser" :title-item-class="{'develope': true, 'hidden': !Options.show.develope}">
				<div class="viewparser scroll p20" v-if="Options.show.develope">
					<ViewParser :parser="Parser.parser" v-if="aTab === 4 && Parser.parser && Parser.parser.content"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>parser</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="XML Object" :title-item-class="{'develope': true, 'hidden': !Options.show.develope}">
				<div class="viewxmlobject scroll p20" v-if="aTab === 5 && Options.show.develope">
					<ViewXmlObject :object="Files.fileObject" v-if="Files.fileObject"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>fileObject</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="Match" :title-item-class="{'develope': true, 'hidden': !Options.show.develope}">
				<div class="viewmatch scroll p20" v-if="aTab === 6 && Options.show.develope">
					<ViewMatch :object="parsedXmlObject" v-if="parsedXmlObject && parsedXmlObject.content"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>parsedXmlObject</b> vorhanden!</div>
				</div>
			</b-tab>
			<template slot="tabs">
				<li class="nav-item extra">
					<b-button size="sm" @click="showTabView = !showTabView" class="vis-dropdown-button"><font-awesome-icon icon="eye"/></b-button>
					<div class="vis-dropdown" v-if="showTabView">
						<button @click="$store.dispatch('TOGGLE_SHOW', 'professional')"><font-awesome-icon :icon="((Options.show.professional) ? 'eye' : 'eye-slash')"/> Professional</button>
						<button @click="$store.dispatch('TOGGLE_SHOW', 'develope')"><font-awesome-icon :icon="((Options.show.develope) ? 'eye' : 'eye-slash')"/> Developer</button>
					</div>
				</li>
			</template>
		</b-tabs>
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import ViewEditor from './ToolPage2/ViewEditor'
	import ViewParser from './ToolPage2/ViewParser'
	import ViewXmlObject from './ToolPage2/ViewXmlObject'
	import ViewMatch from './ToolPage2/ViewMatch'
	import functionParser from './ToolPage2/functionParser'
	import { remote, shell } from 'electron'
	import fPath from 'path'
	const fs = remote.require('fs')

	export default {
		name: 'tool-page-2',
		data () {
			return {
				aTab: 6,
				showTabView: false,
				parsedXmlObject: undefined,
				updateTimer: performance.now(),
				devMode: (process.env.NODE_ENV === 'development'),
				devFiles: undefined,
			}
		},
		computed: {
			...mapState(['Options']),
			...mapState(['Parser']),
			...mapState(['Files']),
		},
		watch: {
			aTab: function (nVal) {
				// ToDo: Caching!
			}
		},
		mounted: function () {
			var t0 = performance.now()
			this.$store.dispatch('LOAD_PARSER_FILE')
			this.$store.dispatch('LOAD_FILE')
			this.parsedXmlObject = functionParser.parseXmlObject(this.Parser.parser, this.Files.fileObject)
			if (this.devMode) {
				this.devFiles = this.devFileList()
			}
			console.log('ToolPage mounted - ' + Math.ceil(performance.now() - t0) + ' ms.')
		},
		methods: {
			showFile () {		// Ordner in Explorer öffnen
				shell.showItemInFolder(this.Files.file)
			},
			devFileList () {
				var aFiles = []
				if (this.devMode) {
					aFiles.push({'file': 'demo2.xml', 'fullFileName': fPath.join(__static, '/demo2.xml')})
					var aPath = 'D:\\OEAW\\Redaktionstool\\Vorlagen\\2018-06-18\\wboe_articles-master\\102_derived_tei'
					var aPathRead = fs.readdirSync(aPath)
					aPathRead.forEach(function (file) {
						var aFullFileName = fPath.join(aPath, file)
						var stats = fs.statSync(aFullFileName)
						if (!stats.isDirectory()) {
							let aExt = file.split('.').pop()
							if (aExt === 'xml') {
								aFiles.push({ 'file': file, 'fullFileName': aFullFileName })
							}
						}
					}, this)
				}
				return aFiles
			},
			devNextFile (next = true) {
				if (this.devMode) {
					var aList = ((next) ? this.devFiles : this.devFiles.slice().reverse())
					var aPos = -1
					aList.some(function (aVal, aKey) {
						// console.log(aVal.fullFileName, this.Files.file, aVal.fullFileName === this.Files.file)
						if (aVal.fullFileName === this.Files.file) {
							aPos = aKey
							return true
						}
					}, this)
					console.log(aPos)
					if (aPos >= 0 && aPos < aList.length - 1) {
						aPos += 1
					} else {
						aPos = 0
					}
					console.log(aPos)
					console.log(aList[aPos])
					this.devSelectFile(aList[aPos].fullFileName)
				}
			},
			devSelectFile (file) {
				if (this.devMode && file !== undefined) {
					var t0 = performance.now()
					this.$store.dispatch('LOAD_FILE', file)
					this.parsedXmlObject = functionParser.parseXmlObject(this.Parser.parser, this.Files.fileObject)
					console.log('devSelectFile - ' + Math.ceil(performance.now() - t0) + ' ms.')
				}
			},
			updateData () {
				this.$store.dispatch('RELOAD_PARSER_FILE')
				this.$store.dispatch('RELOAD_FILE')
				this.parsedXmlObject = functionParser.parseXmlObject(this.Parser.parser, this.Files.fileObject)
			},
			mousedown (e) {
				if (this.showTabView && !(e.target.closest('.vis-dropdown') || e.target.closest('.vis-dropdown-button'))) {
					this.showTabView = false
				}
			}
		},
		created: function () {
			window.addEventListener('mousedown', this.mousedown)
		},
		beforeUpdate: function () {
			this.updateTimer = performance.now()
		},
		updated: function () {
			console.log('updated: ' + Math.ceil(performance.now() - this.updateTimer) + ' ms.')
		},
		beforeDestroy: function () {
			window.removeEventListener('mousedown', this.mousedown)
		},
		components: {
			ViewEditor,
			ViewParser,
			ViewXmlObject,
			ViewMatch,
		}
	}
</script>

<style>
	.tool-page {
		margin-top: 10px;
	}
	.tabc {
		border: 1px solid #eee;
		border-top: none;
		min-height: 75vh;
	}
	.lh76vh, .tabc > div > .scroll {
		height: 75vh;
	}
	.tabc > div > .scroll.wtool, .tabc > div > .ohidden.wtool {
		height: calc( 75vh - 49px )
	}
	.toolbar {
		margin-bottom: 0px;
		border-bottom: 1px solid #eee;
		background: #f8f9fa;
		padding: 8px 7px;
	}
	.main-toolbar {
		margin-bottom: 10px;
	}
	.fal-br {
		transform: translate(9px, 8px);
		color: #fff;
	}

	li.nav-item.extra {
		position: absolute;
		right: 0;
		padding: 5px;
	}
	li.nav-item.extra > a {
		border: none !important;
	}

	li.nav-item.develope > a, li.nav-item.professional > a {
		position: relative;
	}
	li.nav-item.develope > a {
		color: #5ca9fb;
	}
	li.nav-item.develope > a:after, li.nav-item.professional > a:after {
		position: absolute;
		top: -1px;
		right: 3px;
		font-size: 10px;
	}
	li.nav-item.develope > a:after {
		content: "Dev";
		color: #fd7a7a;
	}
	li.nav-item.professional > a:after {
		content: "Pro";
		color: #fbbe60;
	}

	.vis-dropdown {
		position: absolute;
		right: 5px;
		top: calc( 100% - 2px );
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 5px;
		z-index: 5000;
	}
	.vis-dropdown > button {
		white-space: nowrap;
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		margin-bottom: 2px;
		border: none;
		cursor: pointer;
	}
	p.form-control.file-name {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		direction: rtl;
		text-align: left;
	}
</style>
