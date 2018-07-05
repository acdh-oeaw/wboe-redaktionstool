<template>
	<div class="start-page">
		<h1>Übersicht</h1>
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
				if (aFileData.isDir) {
					aFileData.folderContent = this.readFolder(aFullFileName)
				}
				aPathContent.push(aFileData)
			}, this)
			return aPathContent
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
