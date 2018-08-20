<template>
	<div :id="'eo' + content.uId" class="inline" :style="'font-size: ' + ((content.parserObj.options && content.parserObj.options.get('layout.fontsize')) ? content.parserObj.options.get('layout.fontsize') : 100) + '%;'">
		<!-- Vor Inhalten -->
		<template v-if="content.isMultiple && content.multipleNr === 0 && content.parserObj.options && content.parserObj.options.get('layout.multiple.use')">
			<div :style="'height: ' + content.parserObj.options.get('layout.multiple.spaceBefore') + 'px'" v-if="content.parserObj.options.get('layout.multiple.spaceBefore')"></div>
			<h4 @contextmenu.prevent="contextMenue" v-if="content.parserObj.options.get('layout.multiple.header')">{{ content.parserObj.options.get('layout.multiple.header') }}</h4>
			<span class="before" v-if="content.parserObj.options.get('layout.multiple.before')">{{ content.parserObj.options.get('layout.multiple.before') }}</span>
		</template>

		<div :style="'height: ' + content.parserObj.options.get('layout.spaceBefore') + 'px'" v-if="content.parserObj.options && content.parserObj.options.get('layout.spaceBefore')"></div>
		<h4 @contextmenu.prevent="contextMenue" v-if="content.parserObj.options && content.parserObj.options.get('layout.header')">{{ content.parserObj.options.get('layout.header') }}</h4>
		<span class="before" v-if="content.parserObj.options && content.parserObj.options.get('layout.before')">{{ content.parserObj.options.get('layout.before') }}</span>


		<!-- Inhalte -->
		<div :class="{'obj': true, 'just-childs': true, 'warnings': content.warnings.length > 0}" v-if="layoutBase === 'justChilds'">
			<span class="enumerate" v-if="enumerate" @contextmenu.prevent="contextMenue">{{ enumerate }}&nbsp;</span>
			<slot name="childs"/>		<!-- Kinder -->
		</div>

		<b-card :class="{'obj': true, 'paneldecent': true, 'mitb5': true, 'warnings': content.warnings.length > 0}" v-else-if="layoutBase === 'panel'" no-body>
			<div @contextmenu.prevent="contextMenue" slot="header">
				<button v-b-toggle="'collapse-' + _uid" class="header-btn-toggle">
					<span class="enumerate" v-if="enumerate">{{ enumerate }}&nbsp;</span>
					<span><b>{{ title }}</b></span>
					<font-awesome-icon :icon="((isOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/>
				</button>
			</div>
			<b-collapse v-model="isOpen" :id="'collapse-' + _uid" class="fxcollapse">
				<b-list-group @contextmenu.prevent="contextMenue" flush v-if="content.addableInner.length > 0">
					<b-list-group-item style="background: #eee;">
						<div style="margin: -8px -9px;">
							<b-button @click="addTag(aVal.uId, 'In')" size="sm" :variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))" class="mir5" :key="aKey" v-for="(aVal, aKey) in content.addableInner" v-if="aVal.bShow">
								<font-awesome-icon icon="circle-notch" class="fa-icon"/> {{ aVal.title }}
							</b-button>
						</div>
					</b-list-group-item>
				</b-list-group>
				<b-card-body>
					<div @contextmenu.prevent="contextMenue" class="context">
						<slot/>		<!-- Inhalt -->
					</div>
					<slot name="childs"/>		<!-- Kinder -->
				</b-card-body>
			</b-collapse>
			<div @contextmenu.prevent="contextMenue" slot="footer" style="margin: -8px -9px;" v-if="content.addableAfter.length > 0">
				<b-button @click="addTag(aVal.uId, 'After')" size="sm" :variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))" class="mir5" :key="aKey" v-for="(aVal, aKey) in content.addableAfter" v-if="aVal.bShow">
					<font-awesome-icon icon="plus" class="fa-icon"/>
					{{ aVal.title }}
				</b-button>
			</div>
		</b-card>

		<div :class="'obj lb-' + layoutBase + ((content.warnings.length > 0) ? ' warnings' : '')" v-else>
			<div @contextmenu.prevent="contextMenue" class="context">
				<span class="enumerate" v-if="enumerate">{{ enumerate }}&nbsp;</span>
				<b v-if="shownTitle">{{ shownTitle }}:</b><br v-if="shownTitle && layoutBase === 'box'"/>
				<slot/>		<!-- Inhalt -->
			</div>
			<div @contextmenu.prevent="contextMenue" :class="{'addable-in-btn': true, 'inline': layoutBase !== 'box'}"
					 @mouseenter="showAddableButtons('In')" @mouseleave="hideAddableButtons($event, 'In')"
			 			v-if="addableInButtons.length > 0">
				<b-button @click="addTag(addableInButtons[0].uId, 'In')" size="xs"
									@focus="showAddableButtons('In')"
									@blur="hideAddableButtons($event, 'In')"
									ref="addableInButton"
									:variant="((addableInButtons[0].type === 'self') ? 'success' : ((addableInButtons[0].type === 'anywhere') ? 'secondary' : 'primary'))"><font-awesome-icon icon="circle-notch" class="fa-icon"/></b-button>
				<div class="addable-in-btns" v-if="isOpenAdditionalAddInBtn">
					<b-button @click="addTag(aVal.uId, 'In')" @blur="hideAddableButtons($event, 'In')" size="xs"
										:variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))" :class="{'first': aKey === addableInButtons.length - 1}"
										:key="aKey" ref="addableInButtons"	v-for="(aVal, aKey) in addableInButtons.slice().reverse()">
						<font-awesome-icon icon="circle-notch" class="fa-icon"/> {{ aVal.title }}
					</b-button>
				</div>
			</div>
			<slot name="childs"/>		<!-- Kinder -->
			<div @contextmenu.prevent="contextMenue" :class="{'addable-after-btn': true, 'inline': layoutBase !== 'box'}"
					 @mouseenter="showAddableButtons('After')" @mouseleave="hideAddableButtons($event, 'After')"
			 			v-if="addableAfterButtons.length > 0">
				<b-button @click="addTag(addableAfterButtons[0].uId, 'After')" size="xs"
									@focus="showAddableButtons('After')"
									@blur="hideAddableButtons($event, 'After')"
									ref="addableAfterButton"
									:variant="((addableAfterButtons[0].type === 'self') ? 'success' : ((addableAfterButtons[0].type === 'anywhere') ? 'secondary' : 'primary'))"><font-awesome-icon icon="plus" class="fa-icon"/></b-button>
				<div class="addable-after-btns" v-if="isOpenAdditionalAddAfterBtn">
					<b-button @click="addTag(aVal.uId, 'After')" @blur="hideAddableButtons($event, 'After')" size="xs"
										:variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))" :class="{'first': aKey === addableAfterButtons.length - 1}"
										@keyup.up.prevent=""
										@keyup.down.prevent=""
										:key="aKey" ref="addableAfterButtons"	v-for="(aVal, aKey) in addableAfterButtons.slice().reverse()">
						<font-awesome-icon icon="plus" class="fa-icon"/> {{ aVal.title }}
					</b-button>
				</div>
			</div>
		</div>


		<!-- Nach Inhalten -->
		<span class="join" v-if="content.isMultiple && !content.multipleLast && content.parserObj.options.get('layout.multiple.use') && content.parserObj.options.get('layout.multiple.join')">
			{{ content.parserObj.options.get('layout.multiple.join') }}
		</span>

		<span class="after" v-if="content.parserObj.options && content.parserObj.options.get('layout.after')">{{ content.parserObj.options.get('layout.after') }}</span>
		<h4 v-if="content.parserObj.options && content.parserObj.options.get('layout.footer')">{{ content.parserObj.options.get('layout.footer') }}</h4>
		<div :style="'height: ' + content.parserObj.options.get('layout.spaceAfter') + 'px'" v-if="content.parserObj.options && content.parserObj.options.get('layout.spaceAfter')"></div>

		<template v-if="content.isMultiple && content.multipleLast && content.parserObj.options.get('layout.multiple.use')">
			<span class="after" v-if="content.parserObj.options.get('layout.multiple.after')">{{ content.parserObj.options.get('layout.multiple.after') }}</span>
			<br v-if="content.parserObj.options.get('layout.multiple.lastBR')"/>
			<h4 v-if="content.parserObj.options.get('layout.multiple.footer')">{{ content.parserObj.options.get('layout.multiple.footer') }}</h4>
			<div :style="'height: ' + content.parserObj.options.get('layout.multiple.spaceAfter') + 'px'" v-if="content.parserObj.options.get('layout.multiple.spaceAfter')"></div>
		</template>


		<!-- Kontext Menü -->
		<EditorContextMenu :content="content" ref="contextMenuEditor" v-if="contextMenuCached"/>
	</div>
</template>

<script>
	import EditorContextMenu from './EditorContextMenu'

	export default {
		name: 'EditorObjFrame',
		props: {
			content: Object,
		},
		data () {
			return {
				'isOpen': true,
				'contextMenuCached': false,
				'isOpenAdditionalAddAfterBtn': false,
				'isOpenAdditionalAddInBtn': false,
			}
		},
		computed: {
			layoutBase () {		// Mögliche Rückgabewerte: 'panel'/'panelClosed', 'justChilds', 'box', 'line' und 'inline'
				if (this.content.isRoot) { return 'justChilds' }
				if (this.content.parserObj.options && this.content.parserObj.options.get('layout.frame')) {
					if (this.content.parserObj.options.get('layout.frame') === 'panelClosed') {
						this.isOpen = false
						return 'panel'
					}
					return this.content.parserObj.options.get('layout.frame')
				}
				return 'panel'
			},
			title () {
				if (this.content.parserObj.options) {
					if (this.content.parserObj.options.getResult('title')) {
						return this.content.parserObj.options.getResult('title')
					} else if (this.content.parserObj.options.get('tagAsTitle') || this.layoutBase === 'panel') {
						return this.content.orgXmlObj.name
					}
				}
				return null
			},
			shownTitle () {
				if (this.content.parserObj.options && !this.content.parserObj.options.get('layout.hideTitle')) {
					return this.title
				}
				return null
			},
			addableAfterButtons () {
				let outAddable = []
				if (this.content.addableAfter) {
					this.content.addableAfter.forEach(function (aA) {
						if (aA.bShow) {
							outAddable.push(aA)
						}
					}, this)
				}
				return outAddable
			},
			addableInButtons () {
				let outAddable = []
				if (this.content.addableInner) {
					this.content.addableInner.forEach(function (aA) {
						if (aA.bShow) {
							outAddable.push(aA)
						}
					}, this)
				}
				return outAddable
			},
			enumerate () {
				if (this.content.parserObj.options && this.content.isMultiple) {
					if (this.content.parserObj.options.get('layout.multiple.enumerateFX')) {
						if (this.content.parserCopyDeep === 0) {
							return this.num2rom(this.content.multipleNr + 1) + '. '
						} else if (this.content.parserCopyDeep === 1) {
							return this.content.multipleNr + 1 + '. '
						} else if (this.content.parserCopyDeep >= 2) {
							return this.num2abc(this.content.multipleNr + 1) + ') '
						}
					}
					if (this.content.parserObj.options.get('layout.multiple.enumerateRom')) {
						return this.num2rom(this.content.multipleNr + 1) + '. '
					}
					if (this.content.parserObj.options.get('layout.multiple.enumerate')) {
						return this.content.multipleNr + 1 + '. '
					}
				}
			}
		},
		watch: {
			'isOpenAdditionalAddAfterBtn' (nVal) {
				if (nVal) {
					this.$nextTick(() => {
						let refAB = this.$refs.addableAfterButtons[this.$refs.addableAfterButtons.length - 1]
						if (refAB) {
							refAB.focus()
						}
					})
				}
			},
			'isOpenAdditionalAddInBtn' (nVal) {
				if (nVal) {
					this.$nextTick(() => {
						let refAB = this.$refs.addableInButtons[this.$refs.addableInButtons.length - 1]
						if (refAB) {
							refAB.focus()
						}
					})
				}
			},
		},
		methods: {
			showAddableButtons (type) {
				this['isOpenAdditionalAdd' + type + 'Btn'] = true
			},
			hideAddableButtons (e, type) {
				this.$nextTick(() => {
					if (e.type === 'blur') {
						if (this.$refs['addable' + type + 'Button'] === document.activeElement || this.$refs['addable' + type + 'Buttons'].indexOf(document.activeElement) > -1) {
							return false
						}
					}
					this['isOpenAdditionalAdd' + type + 'Btn'] = false
				})
			},
			contextMenue (e) {
				this.contextMenuCached = true
				this.$nextTick(() => {
					this.$refs.contextMenuEditor.open(e)
				})
			},
			addTag (aParUId, type) {
				this['isOpenAdditionalAdd' + type + 'Btn'] = false
				if (type === 'After') {
					this.content.addAfter(this.content.parserObj.root.family[aParUId])
				} else if (type === 'In') {
					this.content.add(0, this.content.parserObj.root.family[aParUId])
				}
			},
			num2rom (num) {		// Römische Zahlen
				var rom = ''
				var aRom = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
				var aNum = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
				num = parseInt(num)
				if (isNaN(num) || (num <= 0)) { return 'Fehler' }
				for (var nr = 0; nr < aNum.length; nr++) {
					while (num >= aNum[nr]) {
						rom += aRom[nr]
						num -= aNum[nr]
					}
				}
				return rom
			},
			num2abc (num) {		// Alphabetische Zahlen
				var bChar = ('a').charCodeAt(0)
				var abc = ''
				do {
					num -= 1
					abc = String.fromCharCode(bChar + (num % 26)) + abc
					num = (num / 26) >> 0
				} while (num > 0)
				return abc
			},
		},
		components: {
			EditorContextMenu,
		}
	}
</script>

<style scoped>
	.inline, .context {
		display: inline;
		cursor: default;
	}

	.obj.lb-inline {
		display: inline;
		padding: 0px 3px;
	}
	.obj.lb-inline:hover {
		background: #eee;
	}
	.obj.lb-hide {
		display: none;
	}
	.obj.warnings {
		background: #fff4b9;
	}
	.focusVisInline {
		display: none;
	}
	*:focus > .focusVisInline {
		display: inline;
	}
	h4 {
		margin-top: 10px;
	}
	h4:first-child {
		margin-top: 0px;
	}
	.enumerate {
		font-weight: bold;
	}
	.addable-after-btn, .addable-in-btn {
		position: relative;
	}
	.addable-after-btns, .addable-in-btns {
		position: absolute;
		bottom: 100%;
		left: 0;
		border: 1px solid #bbb;
		background: #eee;
		border-radius: 5px;
		padding: 3px 6px;
	}
	.addable-after-btns > button, .addable-in-btns > button {
		display: block;
		width: 100%;
		margin: 3px 0;
		text-align: left;
	}
	.addable-after-btns > button.first, .addable-in-btns > button.first {
		font-weight: bolder;
	}
</style>
