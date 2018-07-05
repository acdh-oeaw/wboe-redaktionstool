<template>
	<div class="file">
		<div class="fileline">
			<button @click="isOpen = !isOpen"><font-awesome-icon :icon="((file.isDir) ? ((isOpen) ? 'folder-open' : 'folder') : 'file')"/>
				{{ file.file }}
				<span class="filesize" v-if="!file.isDir">{{ file.size }}</span>
			</button>
		</div>
		<FileLine :file="fFile" v-for="(fFile, fKey) in file.folderContent" :key="fKey" v-if="file.isDir && isOpen"/>
	</div>

</template>

<script>
	export default {
		name: 'FileLine',
		props: {
			file: Object
		},
		data () {
			return {
				'isOpen': false
			}
		},
		computed: {
		}
	}
</script>

<style scoped>
	.fileline > button {
		width: 100%;
		text-align: left;
		margin: 0px;
		padding: 0px;
		background: none;
		border: none;
	}
	.file > .file {
    margin-left: 25px;
	}
	.filesize {
		float: right;
	}
</style>
