<template>
	<div class="start-page">
		<br>
		<h2>Übersicht</h2>
		<div class="project-path" v-if="Options.projectPath">
			<p>
				<font-awesome-icon icon="project-diagram"/>
				{{ Options.projectPath }}
				<button @click="selectFolder"><font-awesome-icon icon="edit"/></button>
				<button @click="showFolder" title="Ordner in Explorer öffnen"><font-awesome-icon icon="external-link-alt"/></button>
				<button @click="updateFolder" title="Projektpfad neu laden"><font-awesome-icon icon="sync-alt"/></button>
				<button @click="showParser" :title="'Parser-Datei in Explorer anzeigen\n' + Options.parserFile" class="float-right" v-if="Options.parserFile && !(Options.parserFile.indexOf('app.asar') > -1)"><font-awesome-icon icon="external-link-alt"/></button>
				<button @click="saveParser" title="Parser-Datei speichern unter ..." class="float-right" v-else-if="Options.parserFileContent && Options.parserFileContent.length > 1"><font-awesome-icon icon="file-download"/></button>
			</p>
			<div v-if="Files.paths[Options.projectPath]">
				<FileLine :path="path" @loading="loading = true" v-for="(path, fKey) in Files.paths[Options.projectPath].paths" :key="'path-' + fKey" :base="Options.projectPath"/>
				<FileLine :file="file" @loading="loading = true" v-for="(file, fKey) in Files.paths[Options.projectPath].files" :key="'file-' + fKey" :base="Options.projectPath"/>
			</div>
		</div>
		<b-alert show variant="danger" v-else>Projektpfad nicht vergeben!</b-alert>
		<div id="loading" v-if="loading">Lade ...</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import FileLine from './StartPage/FileLine'
const { shell } = require('electron')

export default {
	name: 'start-page',
	data () {
		return {
			loading: false
		}
	},
	computed: {
		...mapState(['Options']),
		...mapState(['Files'])
	},
	watch: {
		'Options.projectPath': function (nVal) {
			if (nVal !== undefined) {
				this.loading = true
				this.$store.dispatch('CLEAN_PATH', this.Options.projectPath)
				this.$store.dispatch('GET_PATH', this.Options.projectPath)
				this.loading = false
			}
		}
	},
	methods: {
		selectFolder () {		// Projektpfad auswählen und speichern
			this.loading = true
			this.$store.dispatch('DIALOG_PROJECT_PATH')	// Verzeichniss Dialog
			this.$store.dispatch('SET_PROJECT_PATH')		// Projektpfad speichern
			this.updateFolder()
			this.loading = false
		},
		showFolder () {		// Ordner in Explorer öffnen
			shell.openItem(this.Options.projectPath)
		},
		updateFolder () {		// Projektpfad neu laden
			this.$store.dispatch('CLEAN_PATH', this.Options.projectPath)
			this.$store.dispatch('GET_PATH', this.Options.projectPath)
		},
		showParser () {		// Parser-Datei in Explorer anzeigen
			shell.showItemInFolder(this.Options.parserFile)
		},
		saveParser () {		// Parser-Datei speichern unter ...
			this.$store.dispatch('DIALOG_SAVE_PARSER')	// Speicher Dialog
			this.$store.dispatch('GET_PARSER_FILE')
			this.updateFolder()
		}
	},
	mounted: function () {
		this.loading = true
		if (this.Options.projectPath === undefined) {		// Projektpfad laden
			this.$store.dispatch('GET_PROJECT_PATH')
		}
		this.updateFolder()
		this.loading = false
	},
	components: {
		FileLine
	}
}
</script>

<style scoped>
	button {
		margin: 0px;
		padding: 0px;
		background: none;
		border: none;
	}
	button:not([disabled]) {
		cursor: pointer;
	}
	#loading {
		position: absolute;
		background: rgba(0, 0, 0, 0.25);
		color: #fff;
		text-align: center;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		padding-top: calc( 50vh - 25px );
		font-size: 50px;
		line-height: 1;
	}
</style>
