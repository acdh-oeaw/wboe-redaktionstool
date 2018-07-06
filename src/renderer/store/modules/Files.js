import Vue from 'vue'
import { remote } from 'electron'
import fPath from 'path'
const fs = remote.require('fs')

const state = {
	paths: {}
}

const mutations = {
	CLEAN_CONTENT: (state) => {
		state.paths = {}
	},
	SET_CONTENT: (state, { path, files, paths }) => {
		Vue.set(state.paths, path, {paths: paths, files: files})
	},
	TOGGLE_PATH_OPEN: (state, { path, fileKey }) => {
		state.paths[path].paths[fileKey].isOpen = !state.paths[path].paths[fileKey].isOpen
	},
}

const actions = {
	// ToDo: UPDATE_PATHS
	TOGGLE_OPEN: function ({ commit, dispatch }, {path, fileKey}) {
		if (state.paths[path] && state.paths[path].paths && state.paths[path].paths[fileKey]) {
			commit('TOGGLE_PATH_OPEN', { path: path, fileKey: fileKey })
			if (state.paths[path].paths[fileKey].isOpen && state.paths[state.paths[path].paths[fileKey].fullFileName] === undefined) {
				dispatch('GET_PATH', state.paths[path].paths[fileKey].fullFileName)
			}
		}
	},
	CLEAN_PATH: function ({ commit, dispatch }, {path, fileKey}) {
		commit('CLEAN_CONTENT')
	},
	GET_PATH: function ({ commit }, path) {
		console.log('GET_PATH', path)
		let files = []
		let paths = []
		try {
			var aPathRead = fs.readdirSync(path)
		} catch (e) {
			aPathRead = []
			console.log(e)
		}
		aPathRead.forEach(function (file) {
			var aFullFileName = fPath.join(path, file)
			try {
				var stats = fs.statSync(aFullFileName)
			} catch (e) {
				stats = undefined
				console.log(e)
			}
			if (stats) {
				if (stats.isDirectory()) {
					paths.push({
						file: file,
						fullFileName: aFullFileName,
						isOpen: false,
						size: stats.size
					})
				} else {
					let aExt = file.split('.').pop()
					if (aExt === 'xml') {
						files.push({
							file: file,
							ext: aExt,
							fullFileName: aFullFileName,
							size: stats.size
						})
					}
				}
			}
		}, this)
		files = files.slice().sort((a, b) => {
			if (a.file.toLowerCase() > b.file.toLowerCase()) { return 1 }
			if (a.file.toLowerCase() < b.file.toLowerCase()) { return -1 }
			return 0
		})
		paths = paths.slice().sort((a, b) => {
			if (a.file.toLowerCase() > b.file.toLowerCase()) { return 1 }
			if (a.file.toLowerCase() < b.file.toLowerCase()) { return -1 }
			return 0
		})
		commit('SET_CONTENT', { path: path, files: files, paths: paths })
	}
}

export default {
	state,
	mutations,
	actions
}
