<template>
	<b-dropdown variant="val-focus" no-caret>
		<template slot="button-content">
			<span class="select">{{ selectedText }}&nbsp;<font-awesome-icon icon="caret-down" class="fa-icon float-right"/></span>
		</template>
		<!-- ToDo: canBeEmpty !?! -->
		<b-dropdown-item @click="select(aKey)" :active="aKey === selected" :key="aKey" v-for="(aVal, aKey) in aValues">
			<font-awesome-icon icon="check" class="fa-icon" v-if="aKey === selected"/></span> {{ aVal }}
		</b-dropdown-item>
	</b-dropdown>
</template>

<script>
	export default {
		name: 'SelectPossibleValues',
		props: {
			selected: Number,
			selectedText: String,
			values: Array,
		},
		data () {
			return {
				'isOpen': true,
			}
		},
		computed: {
			aValues () {
				let aValList = []
				this.values.forEach(function (aVal) {
					aValList.push(aVal.title || aVal.value || aVal)
				}, this)
				return aValList
			}
		},
		methods: {
			select: function (key) {
				this.$emit('select', key)
			}
		},
	}
</script>

<style scoped>
	.select {
		display: inline-block;
		position: relative;
		cursor: pointer;
		border: none;
		background: none;
		border-radius: 5px;
		padding: 0px 5px;
	}
	.select:hover {
		background: #eef;
	}
	.dropdown-item > .fa-icon {
		position: absolute;
		left: 5px;
		margin-top: 4px;
	}
</style>
