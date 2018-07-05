<template>
	<div class="start-page">
		<br>
		<h1>Übersicht</h1>
		<br>
		<FileLine :file="file" v-for="(file, fKey) in files" :key="fKey"/>
	</div>
</template>

<script>
import FileLine from './StartPage/FileLine'
import { remote } from 'electron'
import path from 'path'
const fs = remote.require('fs')

export default {
	name: 'start-page',
	data () {
		return {
			folder: undefined,
			files: []
		}
	},
	watch: {
		folder: function (nVal) {
			if (nVal !== undefined) {
				this.files = this.readFolder(this.folder)
			}
		}
	},
	methods: {
		readFolder (aPath) {
			var aPathContent = []
			fs.readdirSync(aPath).forEach(function (file) {
				var aFullFileName = path.join(aPath, file)
				var stats = fs.statSync(aFullFileName)
				var aFileData = {file: file, fullFileName: aFullFileName, isDir: stats.isDirectory(), size: stats.size}
				if (aFileData.isDir) {	// ToDo: Nur laden wenn geöffnet wurde!
					aFileData.folderContent = this.readFolder(aFileData.fullFileName)
				}
				aPathContent.push(aFileData)
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
		this.folder = remote.app.getPath('userData')
	},
	components: {
		FileLine
	}
}
</script>
