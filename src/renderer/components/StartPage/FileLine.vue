<template>
	<div :class="{'file': true, 'open': (path && isOpen)}">

		<div class="pathline" v-if="path">
			<button @click="toggleMe()" :title="path.fullFileName" :class="{'active': (Files.file && Files.file.indexOf(path.fullFileName) === 0)}">
				<span class="path"><font-awesome-icon :icon="((isOpen) ? 'folder-open' : 'folder')" class="mir5"/>{{ path.file }}</span>
				<span class="foldercontent" v-if="Files.paths[path.fullFileName]">
					<span class="info">{{ Files.paths[path.fullFileName].files.length.toLocaleString() }} <font-awesome-icon icon="file"/></span>
					<span class="info">{{ Files.paths[path.fullFileName].paths.length.toLocaleString() }} <font-awesome-icon icon="folder"/></span>
				</span>
				<span class="foldercontent unknown" v-else><span class="info">? <font-awesome-icon icon="file"/></span><span class="info">? <font-awesome-icon icon="folder"/></span></span>
			</button>
			<div class="subdata" v-if="isOpen && Files.paths[path.fullFileName]">
				<FileLine :path="sPath" @loading="loading" @new="newFile" v-for="(sPath, fKey) in Files.paths[path.fullFileName].paths" :key="'path-' + fKey" :base="path.fullFileName"/>
				<button @click="$emit('new', path.fullFileName)" title="Neue Datei erstellen ..." class="fileline-btn new-file"><font-awesome-icon icon="asterisk"/><span>Neue Datei erstellen ...</span></button>
				<FileLine :file="sFile" @loading="loading" @new="newFile" v-for="(sFile, fKey) in Files.paths[path.fullFileName].files" :key="'file-' + fKey" :base="path.fullFileName"/>
			</div>
		</div>

		<div class="fileline" v-if="file">
			<button @click="loadFile()" :title="file.fullFileName" :class="{'active': isActiveFile, 'italic': isParser}">
				<span class="file"><font-awesome-icon :icon="((isParser) ? 'project-diagram' : ((isActiveFile) ? 'book-open' : 'file'))" class="mir5"/>{{ file.file }}</span>
				<span class="filesize" v-if="!file.isDir">{{ file.size | prettyBytes }}</span>
			</button>
		</div>

	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import _ from 'lodash'

	export default {
		name: 'FileLine',
		props: {
			base: String,
			file: Object,
			path: Object
		},
		computed: {
			...mapState(['Files']),
			...mapState(['Options']),
			isParser () {
				if (this.file) {
					return (this.file.file.substr(0, 6) === 'parser')
				}
			},
			isOpen () {
				if (this.path) {
					return this.Files.paths[this.path.fullFileName] && this.Files.paths[this.path.fullFileName].isOpen
				}
			},
			isActiveFile () {
				if (this.file) {
					return this.Files.file === this.file.fullFileName
				}
			},
		},
		methods: {
			toggleMe () {		// Verzeichniss öffnen/schließen
				this.$store.dispatch('TOGGLE_OPEN', {path: this.path.fullFileName})
			},
			loading () {
				this.$emit('loading')
			},
			loadFile () {		// Lade Datei
				if (!this.isParser) {
					this.$emit('loading')
					this.debouncedLoadFile()
				}
			},
			newFile (nf) {
				this.$emit('new', nf)
			},
			debouncedLoadFile: _.debounce(function () {		// Verzögert öffnen damit "Laden ..." angezeigt wird
				this.$store.dispatch('LOAD_FILE', this.file.fullFileName)		// Datei laden
				// Nur Tool öffnen wenn Datei lesbar!
				this.$router.push('/tool')		// Tool öffnen
			}, 50),
		}
	}
</script>

<style scoped>
	.pathline > button, .fileline > button, .fileline-btn {
		width: 100%;
		text-align: left;
		margin: 0px;
		padding: 0px;
		background: none;
		border: none;
	}
	.fileline-btn.new-file {
		color: #666;
		font-style: italic;
	}
	.fileline .file > svg, .pathline .path > svg, .fileline-btn > svg {
		width: 1.125em;
		margin: 0 5px;
	}
	.pathline > button.active, .fileline > button.active, .fileline-btn.active {
		color: #33f;
	}
	.pathline > button:hover, .fileline > button:hover, .fileline-btn:hover {
		color: #000;
		background: #eee;
	}
	.foldercontent > .info {
    margin-left: 6px;
	}
	.foldercontent > .info > svg {
		margin-left: 2px;
	}
	.subdata {
    margin-left: 25px;
	}
	button:not([disabled]) {
		cursor: pointer;
	}
	.filesize, .foldercontent {
		float: right;
		font-size: 12px;
	}
	.foldercontent.unknown {
		color: #999;
	}
</style>
