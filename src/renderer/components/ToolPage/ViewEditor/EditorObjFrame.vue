<template>
	<div class="inline">
		<template v-if="content.isMultiple && content.multipleNr === 0 && content.parserObj.options && content.parserObj.options.get('layout.multiple.use')">
			<div :style="'height: ' + content.parserObj.options.get('layout.multiple.spaceBefore') + 'px'" v-if="content.parserObj.options.get('layout.multiple.spaceBefore')"></div>
			<h3 @contextmenu.prevent="contextMenue" v-if="content.parserObj.options.get('layout.multiple.header')">{{ content.parserObj.options.get('layout.multiple.header') }}</h3>
			<span class="before" v-if="content.parserObj.options.get('layout.multiple.before')">{{ content.parserObj.options.get('layout.multiple.before') }}</span>
		</template>

		<div :style="'height: ' + content.parserObj.options.get('layout.spaceBefore') + 'px'" v-if="content.parserObj.options && content.parserObj.options.get('layout.spaceBefore')"></div>
		<h3 @contextmenu.prevent="contextMenue" v-if="content.parserObj.options && content.parserObj.options.get('layout.header')">{{ content.parserObj.options.get('layout.header') }}</h3>
		<span class="before" v-if="content.parserObj.options && content.parserObj.options.get('layout.before')">{{ content.parserObj.options.get('layout.before') }}</span>
		<span class="enumeraterom" v-if="content.isMultiple && content.parserObj.options && content.parserObj.options.get('layout.multiple.enumerateRom')">{{ num2rom(content.multipleNr + 1) }}.&nbsp;</span>
		<span class="enumerate" v-if="content.isMultiple && content.parserObj.options && content.parserObj.options.get('layout.multiple.enumerate')">{{ content.multipleNr + 1 }})&nbsp;</span>

		<div :class="{'obj': true, 'just-childs': true, 'warnings': content.warnings.length > 0}" v-if="layoutBase === 'justChilds'">
			<slot name="childs"/>		<!-- Kinder -->
		</div>


		<b-card :class="{'obj': true, 'paneldecent': true, 'mitb5': true, 'warnings': content.warnings.length > 0}" v-else-if="layoutBase === 'panel'" :header="title" no-body>
			<div @contextmenu.prevent="contextMenue" slot="header">
				<button v-b-toggle="'collapse-' + _uid" class="header-btn-toggle">
					<span><b>{{ title }}</b></span>
					<font-awesome-icon :icon="((isOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/>
				</button>
			</div>
			<b-collapse v-model="isOpen" :id="'collapse-' + _uid">
				<b-list-group @contextmenu.prevent="contextMenue" flush v-if="content.addableInner.length > 0">
					<b-list-group-item style="background: #eee;">
						<div style="margin: -8px -9px;">
							<b-button @click="addIn(aVal.uId)" size="sm" :variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))" class="mir5" :key="aKey" v-for="(aVal, aKey) in content.addableInner" v-if="aVal.bShow">
								<font-awesome-icon icon="circle-notch" class="fa-icon"/>
								{{ aVal.title }}
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
				<b-button @click="addAfter(aVal.uId)" size="sm" :variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))" class="mir5" :key="aKey" v-for="(aVal, aKey) in content.addableAfter" v-if="aVal.bShow">
					<font-awesome-icon icon="plus" class="fa-icon"/>
					{{ aVal.title }}
				</b-button>
			</div>
		</b-card>

		<div :class="'obj lb-' + layoutBase + ((content.warnings.length > 0) ? ' warnings' : '')" v-else>
			<div @contextmenu.prevent="contextMenue" class="context">
				<b v-if="title">{{ title }}:</b><br v-if="title && layoutBase === 'box'"/>
				<slot/>		<!-- Inhalt -->
			</div>
			<div  @contextmenu.prevent="contextMenue" :class="{'inline': layoutBase !== 'box'}" v-if="content.addableInner.length > 0">
				<b-button @click="addIn(content.addableInner[0].uId)" size="xs" variant="success" class="mir5" :title="content.addableInner[0].title" v-if="content.addableInner[0].bShow"><font-awesome-icon icon="circle-notch" class="fa-icon"/><span class="focusVisInline"> {{ content.addableInner[0].title }}</span></b-button>
				<b-button @click="isOpenAdditionalAddInBtn = !isOpenAdditionalAddInBtn" size="xs" variant="secondary" class="mir5" title="Weitere mögliche Tags anzeigen." v-if="content.addableInner.length > 1"><font-awesome-icon :icon="((!isOpenAdditionalAddInBtn) ? 'eye' : 'eye-slash')" class="fa-icon"/></b-button>
				<b-button @click="addIn(aVal.uId)" size="xs" :variant="((aVal.type === 'anywhere') ? 'secondary' : 'primary')" class="mir5" :key="aKey" v-for="(aVal, aKey) in content.addableInner" v-if="aKey !== 0 && isOpenAdditionalAddInBtn">
					<font-awesome-icon icon="circle-notch" class="fa-icon"/>
					{{ aVal.title }}
				</b-button>
			</div>
			<slot name="childs"/>		<!-- Kinder -->
			<div @contextmenu.prevent="contextMenue" :class="{'inline': layoutBase !== 'box'}" v-if="content.addableAfter.length > 0">
				<b-button @click="addAfter(content.addableAfter[0].uId)" size="xs" variant="success" class="mir5" :title="content.addableAfter[0].title" v-if="content.addableAfter[0].type === 'self' && content.addableAfter[0].bShow"><font-awesome-icon icon="plus" class="fa-icon"/><span class="focusVisInline"> {{ content.addableAfter[0].title }}</span></b-button>
				<b-button @click="isOpenAdditionalAddBtn = !isOpenAdditionalAddBtn" size="xs" variant="secondary" class="mir5" title="Weitere mögliche Tags anzeigen." v-if="(content.addableAfter[0].type === 'self' && content.addableAfter.length > 1) || (content.addableAfter[0].type !== 'self' && content.addableAfter.length > 0)"><font-awesome-icon :icon="((!isOpenAdditionalAddBtn) ? 'eye' : 'eye-slash')" class="fa-icon"/></b-button>
				<b-button @click="addAfter(aVal.uId)" size="xs" :variant="((aVal.type === 'anywhere') ? 'secondary' : 'primary')" class="mir5" :key="aKey" v-for="(aVal, aKey) in content.addableAfter" v-if="aVal.type !== 'self' && isOpenAdditionalAddBtn">
					<font-awesome-icon icon="plus" class="fa-icon"/>
					{{ aVal.title }}
				</b-button>
			</div>
		</div>


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
				'isOpenAdditionalAddBtn': false,
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
		},
		methods: {
			contextMenue: function (e) {
				this.contextMenuCached = true
				this.$nextTick(() => {
					this.$refs.contextMenuEditor.open(e)
				})
			},
			addAfter (aParUId) {
				this.content.addAfter(this.content.parserObj.root.family[aParUId])
			},
			addIn (aParUId) {
				this.content.add(0, this.content.parserObj.root.family[aParUId])
			},
			num2rom: function (num) {		// Römische Zahlen
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
		display: inline-block;
		padding: 0px 3px;
	}
	.obj.lb-inline:hover {
		background: #eee;
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
</style>
