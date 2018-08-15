<template>
	<span>{{ pos }}</span>
</template>

<script>
	// import _ from 'lodash'
	// import SelectPossibleValues from './SelectPossibleValues'
	// import veFunctions from './functions'

	export default {
		name: 'InlineAttributes',
		props: {
			content: Object,
			pos: String,
		},
		data () {
			return {
				'isOpen': true,
			}
		},
		computed: {
		},
		watch: {
		},
		methods: {
		},
		components: {
		},
	}
</script>

<style scoped>
	.val-txt {
		padding: 0px 3px;
		padding-bottom: 3px;
    border-radius: 2px;
	}
	.val-txt:hover {
		background: #eef;
	}
	.val-edit {
		display: inline-block;
		min-width:5px;
		padding: 0px 2px;
		cursor: text;
	}
</style>
