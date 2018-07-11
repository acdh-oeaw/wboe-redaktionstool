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
			<div v-if="Files.paths[Options.projectPath]">
				<FileLine :path="path" v-for="(path, fKey) in Files.paths[Options.projectPath].paths" :key="'path-' + fKey" :base="Options.projectPath"/>
				<FileLine :file="file" v-for="(file, fKey) in Files.paths[Options.projectPath].files" :key="'file-' + fKey" :base="Options.projectPath"/>
			</div>
		</div>
		<b-alert show variant="danger" v-else>Projektpfad nicht vergeben!</b-alert>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import FileLine from './StartPage/FileLine'

export default {
	name: 'start-page',
	data () {
		return {
		}
	},
	computed: {
		...mapState(['Options']),
		...mapState(['Files'])
	},
	watch: {
		'Options.projectPath': function (nVal) {
			if (nVal !== undefined) {
				this.$store.dispatch('CLEAN_PATH', this.Options.projectPath)
				this.$store.dispatch('GET_PATH', this.Options.projectPath)
			}
		}
	},
	methods: {
		selectFolder () {		// Projektpfad auswählen und speichern
			this.$store.dispatch('DIALOG_PROJECT_PATH')	// Verzeichniss Dialog
			this.$store.dispatch('SET_PROJECT_PATH')		// Projektpfad speichern
		},
	},
	mounted: function () {
		if (this.Options.projectPath === undefined) {		// Projektpfad laden
			this.$store.dispatch('GET_PROJECT_PATH')
		}
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
