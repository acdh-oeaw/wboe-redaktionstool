<template>
	<div :class="{'file': true, 'open': (path && path.isOpen)}">
		<div class="pathline" v-if="path">
			<button @click="toggleMe()" :title="path.fullFileName">
				<font-awesome-icon :icon="((path.isOpen) ? 'folder-open' : 'folder')" style="width:20px;"/>
				<span>{{ path.file }}</span>
				<span class="foldercontent" v-if="Files.paths[path.fullFileName]">{{ Files.paths[path.fullFileName].files.length.toLocaleString() }} <font-awesome-icon icon="file" style="margin-right:5px;"/> {{ Files.paths[path.fullFileName].paths.length.toLocaleString() }} <font-awesome-icon icon="folder"/></span>
				<span class="foldercontent unknown" v-else>? <font-awesome-icon icon="file" style="margin-right:5px;"/> ? <font-awesome-icon icon="folder"/></span>
			</button>
			<div class="subdata" v-if="path.isOpen && Files.paths[path.fullFileName]">
				<FileLine :path="sPath" @loading="loading" v-for="(sPath, fKey) in Files.paths[path.fullFileName].paths" :key="'path-' + fKey" :base="path.fullFileName"/>
				<FileLine :file="sFile" @loading="loading" v-for="(sFile, fKey) in Files.paths[path.fullFileName].files" :key="'file-' + fKey" :base="path.fullFileName"/>
			</div>
		</div>
		<div class="fileline" v-if="file">
			<button @click="loadFile" :title="file.fullFileName">
				<font-awesome-icon icon="file" style="width:20px;"/>
				<span>{{ file.file }}</span>
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
			...mapState(['Options'])
		},
		methods: {
			toggleMe () {
				this.$store.dispatch('TOGGLE_OPEN', {path: this.base, fileKey: this.$vnode.key.split('-')[1]})
			},
			loading () {
				this.$emit('loading')
			},
			loadFile () {
				this.$emit('loading')
				this.debouncedLoadFile()
			},
			debouncedLoadFile: _.debounce(function () {
				this.$store.dispatch('SET_USE_FILE', this.file.fullFileName)
				this.$router.push('/tool')
			}, 50),
		}
	}
</script>

<style scoped>
	.pathline > button, .fileline > button {
		width: 100%;
		text-align: left;
		margin: 0px;
		padding: 0px;
		background: none;
		border: none;
	}
	.pathline > button:hover, .fileline > button:hover {
		background: #eee;
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
