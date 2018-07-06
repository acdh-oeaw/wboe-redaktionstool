<template>
	<div class="start-page">
		<br>
		<h2>Übersicht</h2>
		<div class="project-path" v-if="Options.projectPath">
			<p>
				<font-awesome-icon icon="project-diagram"/>
				{{ Options.projectPath }}
				<button @click="selectFolder"><font-awesome-icon icon="edit"/></button>
			</p>
			<FileLine :file="file" v-for="(file, fKey) in files" :key="fKey"/>
		</div>
		<b-alert show variant="danger" v-else>Projektpfad nicht vergeben!</b-alert>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import FileLine from './StartPage/FileLine'
import { remote } from 'electron'
import path from 'path'

const fs = remote.require('fs')
// const { dialog } = remote

export default {
	name: 'start-page',
	data () {
		return {
			files: []
		}
	},
	computed: {
		...mapState(['Options'])
	},
	watch: {
		'Options.projectPath': function (nVal) {
			if (nVal !== undefined) {
				this.files = []
				this.files = this.readFolder(this.Options.projectPath)
			}
		}
	},
	methods: {
		selectFolder () {
			this.$store.dispatch('DIALOG_PROJECT_PATH')	// Verzeichniss Dialog
			this.$store.dispatch('SET_PROJECT_PATH')		// Projektpfad speichern
		},
		readFolder (aPath) {
			var aPathContent = []
			try {
				var aPathRead = fs.readdirSync(aPath)
			} catch (e) {
				aPathRead = []
				console.log(e)
			}
			aPathRead.forEach(function (file) {
				var aFullFileName = path.join(aPath, file)
				try {
					var stats = fs.statSync(aFullFileName)
				} catch (e) {
					stats = undefined
					console.log(e)
				}
				if (stats) {
					var aFileData = {file: file, fullFileName: aFullFileName, isDir: stats.isDirectory(), size: stats.size}
					if (aFileData.isDir) {	// ToDo: Nur laden wenn geöffnet wurde!
						aFileData.folderContent = this.readFolder(aFileData.fullFileName)
					}
					aPathContent.push(aFileData)
				}
			}, this)
			return aPathContent.slice().sort((a, b) => {
				if (a.isDir < b.isDir) { return 1 }
				if (a.isDir > b.isDir) { return -1 }
				if (a.file.toLowerCase() > b.file.toLowerCase()) { return 1 }
				if (a.file.toLowerCase() < b.file.toLowerCase()) { return -1 }
				return 0
			})
		}
	},
	mounted: function () {
		if (this.Options.projectPath === undefined) {
			this.$store.dispatch('GET_PROJECT_PATH')
		}
		this.files = this.readFolder(this.Options.projectPath)
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
</style>
