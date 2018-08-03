<template>
	<div class="tool-page">
		<b-button-toolbar class="main-toolbar">
			<b-dropdown size="sm" class="mx-1" right text="Developer - Datei" v-if="devMode">
				<b-dropdown-item @click="updateData()"><b>Parser und Datei neu laden</b></b-dropdown-item>
				<b-dropdown-divider></b-dropdown-divider>
				<b-dropdown-item @click="devSelectFile(aFile.fullFileName)" :active="aFile.fullFileName === Files.file" :class="{'error' : aFile.errors, 'warning': aFile.warnings}" :key="aKey" v-for="(aFile, aKey) in devFiles">
					{{ aFile.file + ((aFile.errors || aFile.warnings) ? ' (Fehler: ' + aFile.errors + ', Warnungen: ' + aFile.warnings + ')' : '') }}
				</b-dropdown-item>
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
				<div class="vieweditor scroll p20" v-if="aTabCach.indexOf(0) > -1">
					<ViewEditor :parser="Parser.parser" v-if="Parser.parser && Parser.parser.content"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>parser</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="Vorschau">
				<div class="viewpreview scroll p20" v-if="aTabCach.indexOf(1) > -1">
				</div>
			</b-tab>
			<b-tab title="Objekt">
				<div class="viewobject scroll p20" v-if="aTabCach.indexOf(2) > -1">
				</div>
			</b-tab>
			<b-tab title="XML Editor" :title-item-class="{'professional': true, 'hidden': !Options.show.professional}">
				<div class="viewxml scroll p20" v-if="aTabCach.indexOf(3) > -1">
				</div>
			</b-tab>
			<b-tab title="Parser Object" :title-item-class="{'develope': true, 'hidden': !Options.show.develope, 'error': (this.Parser.parser && this.Parser.parser.errors && Object.keys(this.Parser.parser.errors).length > 0)}">
				<div class="viewparser scroll p20" v-if="aTabCach.indexOf(4) > -1">
					<ViewParser :parser="this.Parser.parser" v-if="this.Parser.parser && this.Parser.parser.content.length > 0"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>parser</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="XML Object" :title-item-class="{'develope': true, 'hidden': !Options.show.develope}">
				<div class="viewxmlobject scroll p20" v-if="aTabCach.indexOf(5) > -1">
					<ViewXmlObject :object="xmlObject" v-if="xmlObject && xmlObject.content.length > 0"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>XML Objekt</b> vorhanden!</div>
				</div>
			</b-tab>
			<b-tab title="Editor Object" :title-item-class="{'develope': true, 'hidden': !Options.show.develope}">
				<div class="vieweditorobject scroll p20" v-if="aTabCach.indexOf(6) > -1">
					<ViewEditorObject :object="editorObject" v-if="editorObject && editorObject.contentObj"/>
					<div class="alert alert-danger" role="alert" v-else>Kein <b>Editor Objekt</b> vorhanden!</div>
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
	import ViewEditorObject from './ToolPage2/ViewEditorObject'
	import { remote, shell } from 'electron'
	import XmlObject from '@/functions/xml/Xml'
	import EditorObject from '@/functions/editor/Editor'
	import fPath from 'path'
	const fs = remote.require('fs')

	export default {
		name: 'tool-page-2',
		data () {
			return {
				aTab: 6,
				aTabCach: [],
				showTabView: false,
				xmlObject: null,
				editorObject: null,
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
				if (this.aTabCach.indexOf(nVal) < 0) {
					this.aTabCach.push(nVal)
				}
			}
		},
		mounted: function () {
			var t0 = performance.now()
			this.aTabCach = [this.aTab]
			if (this.Parser.parser === undefined) {
				this.$store.dispatch('LOAD_PARSER_FILE')		// Parser Datei laden und Parser Objekt erstellen
			}
			if (this.Files.fileContent === undefined) {		// ToDo: Leere Datei erstellen
				this.$store.dispatch('LOAD_FILE')		// Datei laden
			}
			this.loadData()
			console.log('ToolPage mounted - ' + Math.ceil(performance.now() - t0) + ' ms.')
		},
		methods: {
			showFile () {		// Ordner in Explorer öffnen
				shell.showItemInFolder(this.Files.file)
			},
			devFileList () {
				var t0 = performance.now()
				var aFiles = []
				if (this.devMode) {
					var xmlObjD = new XmlObject.XmlBase(fs.readFileSync(fPath.join(__static, '/demo2.xml'), 'utf8'))
					var editorObjD = new EditorObject.EditorBase(this.Parser.parser, xmlObjD)
					aFiles.push({ 'file': 'demo2.xml', 'fullFileName': fPath.join(__static, '/demo2.xml'), 'errors': Object.keys(editorObjD.errors).length, 'warnings': Object.keys(editorObjD.warnings).length })
					var aPath = 'D:\\OEAW\\Redaktionstool\\Vorlagen\\2018-06-18\\wboe_articles-master\\102_derived_tei'
					var aPathRead = fs.readdirSync(aPath)
					aPathRead.forEach(function (file) {
						var aFullFileName = fPath.join(aPath, file)
						var stats = fs.statSync(aFullFileName)
						if (!stats.isDirectory()) {
							let aExt = file.split('.').pop()
							if (aExt === 'xml') {
								var fileContent = fs.readFileSync(aFullFileName, 'utf8')
								var xmlObj = new XmlObject.XmlBase(fileContent)
								var editorObj = new EditorObject.EditorBase(this.Parser.parser, xmlObj)
								aFiles.push({ 'file': file, 'fullFileName': aFullFileName, 'errors': Object.keys(editorObj.errors).length, 'warnings': Object.keys(editorObj.warnings).length })
							}
						}
					}, this)
				}
				console.log('devFileList() - ' + Math.ceil(performance.now() - t0) + ' ms.')
				return aFiles
			},
			devNextFile (next = true) {
				if (this.devMode) {
					var aList = ((next) ? this.devFiles : this.devFiles.slice().reverse())
					var aPos = -1
					aList.some(function (aVal, aKey) {
						if (aVal.fullFileName === this.Files.file) {
							aPos = aKey
							return true
						}
					}, this)
					aPos = ((aPos >= 0 && aPos < aList.length - 1) ? aPos + 1 : 0)
					this.devSelectFile(aList[aPos].fullFileName)
				}
			},
			devSelectFile (file) {
				if (this.devMode && file !== undefined) {
					var t0 = performance.now()
					this.$store.dispatch('LOAD_FILE', file)
					this.loadData()
					console.log('devSelectFile - ' + Math.ceil(performance.now() - t0) + ' ms.')
				}
			},
			loadData () {
				this.xmlObject = new XmlObject.XmlBase(this.Files.fileContent)		// XML Objekt erstellen
				this.editorObject = new EditorObject.EditorBase(this.Parser.parser, this.xmlObject)		// Editor Objekt erstellen
				if (this.devMode) {
					this.devFiles = this.devFileList()
				}
				this.aTabCach = [this.aTab]
			},
			updateData () {
				this.$store.dispatch('RELOAD_PARSER_FILE')
				this.$store.dispatch('RELOAD_FILE')
				this.loadData()
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
			ViewEditorObject,
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

	li.nav-item.error > a:before {
		content: "!";
		position: absolute;
		top: -9px;
		right: -9px;
		font-size: 14px;
		color: #fff;
		background: #dc3545;
		width: 19px;
		height: 19px;
		text-align: center;
		line-height: 1.24;
		border-radius: 100%;
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
	a.dropdown-item.warning {
    background: #ffe !important;
	}
	a.dropdown-item.active.warning {
    background: #dcdc45 !important;
	}
	a.dropdown-item.error {
    background: #fee !important;
	}
	a.dropdown-item.active.error {
    background: #dc3545 !important;
	}
</style>
