<template>
	<div :id="'po' + content.uId" :class="'inline'" :style="'font-size: ' + ((content.parserObj && content.parserObj.options && content.parserObj.options.get('previewLayout.fontsize')) ? content.parserObj.options.get('previewLayout.fontsize') : 100) + '%;'">
		<!-- Vor Inhalten -->
		<template v-if="content.isMultiple && content.multipleNr === 0 && content.parserObj && content.parserObj.options && content.parserObj.options.get('previewLayout.multiple.use')">
			<div :style="'height: ' + content.parserObj.options.get('previewLayout.multiple.spaceBefore') + 'px'" v-if="content.parserObj.options.get('previewLayout.multiple.spaceBefore')"></div>
			<h4 v-if="content.parserObj.options.get('previewLayout.multiple.header')">{{ content.parserObj.options.get('previewLayout.multiple.header') }}</h4>
			<span class="before" v-if="content.parserObj.options.get('previewLayout.multiple.before')">{{ content.parserObj.options.get('previewLayout.multiple.before') }}</span>
		</template>

		<div :style="'height: ' + content.parserObj.options.get('previewLayout.spaceBefore') + 'px'" v-if="content.parserObj && content.parserObj.options && content.parserObj.options.get('previewLayout.spaceBefore')"></div>
		<h4 v-if="content.parserObj && content.parserObj.options && content.parserObj.options.get('previewLayout.header')">{{ content.parserObj.options.get('previewLayout.header') }}</h4>
		<span class="before" v-if="content.parserObj && content.parserObj.options && content.parserObj.options.get('previewLayout.before')">{{ content.parserObj.options.get('previewLayout.before') }}</span>

		<!-- Inhalte -->
		<!-- justChilds -->
		<div :class="{'obj': true, 'just-childs': true, 'warnings': content.warnings.length > 0}" v-if="layoutBase === 'justChilds'">
			<span :class="{'enumerate': true, 'enumeraterom': content.parserObj.options.get('previewLayout.multiple.enumerateRom'), 'deeper': (content.parserCopyDeep >= 3)}" v-if="enumerate">{{ enumerate }}&nbsp;</span>
			<!-- Kinder -->
			<template v-if="content.childs.length > 0 && !(content.parserObj && content.parserObj.options && content.parserObj.options.get('editor.fxFunction'))">
				<PreviewContent ref="childs" :content="aContent" :key="aContent.uId + '-' + aKey" v-for="(aContent, aKey) in content.childs" v-if="showObj(aContent)"/>
			</template>
		</div>
		<!-- normal -->
		<div :class="'obj lb-' + layoutBase + ((content.warnings.length > 0) ? ' warnings' : '')" v-else>
			<div class="inline rel">
				<span :class="'enumerate' + ((this.content.parserObj.options.get('previewLayout.multiple.enumerateFX'))?' enumeratefx deep' + content.parserCopyDeep:'')" v-if="enumerate">{{ enumerate }}&nbsp;</span>
				<b v-if="shownTitle">{{ shownTitle }}: </b><br v-if="shownTitle && layoutBase === 'box'"/>
				<!-- Inhalt -->
				<span :class="{ 'val-fix': valueType === 'fix',
												'bold': content.parserObj.options.get('previewLayout.bold'),
												'italic': content.parserObj.options.get('previewLayout.italic'),
												'underline': content.parserObj.options.get('previewLayout.underline'),
												'ls1pt': content.parserObj.options.get('previewLayout.ls1pt')
											}"
							v-if="valueType === 'fix' || valueType === 'editable'">{{ content.orgXmlObj.getValueByOption(this.content.parserObj.options.get('value'), false) }}</span>
				<GeoPreview :content="content" v-else-if="content.parserObj && content.parserObj.options && content.parserObj.options.get('editor.fxFunction.name') === 'GeoSelect'"/>
			</div>
			<!-- Kinder -->
			<template v-if="content.childs.length > 0 && !(content.parserObj && content.parserObj.options && content.parserObj.options.get('editor.fxFunction'))">
				<PreviewContent ref="childs" :content="aContent" :key="aContent.uId + '-' + aKey" v-for="(aContent, aKey) in content.childs" v-if="showObj(aContent)"/>
			</template>
		</div>

		<!-- Nach Inhalten -->
		<span class="join" v-if="content.isMultiple && !content.multipleLast && content.parserObj && content.parserObj.options.get('previewLayout.multiple.use') && content.parserObj.options.get('previewLayout.multiple.join')">{{ content.parserObj.options.get('previewLayout.multiple.join') }}</span>

		<span class="after" v-if="content.parserObj && content.parserObj.options && content.parserObj.options.get('previewLayout.after')">{{ content.parserObj.options.get('previewLayout.after') }}</span>
		<h4 v-if="content.parserObj && content.parserObj.options && content.parserObj.options.get('previewLayout.footer')">{{ content.parserObj.options.get('previewLayout.footer') }}</h4>
		<div :style="'height: ' + content.parserObj.options.get('previewLayout.spaceAfter') + 'px'" v-if="content.parserObj && content.parserObj.options && content.parserObj.options.get('previewLayout.spaceAfter')"></div>

		<template v-if="content.isMultiple && content.multipleLast && content.parserObj && content.parserObj.options.get('previewLayout.multiple.use')">
			<span class="after" v-if="content.parserObj.options.get('previewLayout.multiple.after')">{{ content.parserObj.options.get('previewLayout.multiple.after') }}</span>
			<br v-if="content.parserObj.options.get('previewLayout.multiple.lastBR')"/>
			<h4 v-if="content.parserObj.options.get('previewLayout.multiple.footer')">{{ content.parserObj.options.get('previewLayout.multiple.footer') }}</h4>
			<div :style="'height: ' + content.parserObj.options.get('previewLayout.multiple.spaceAfter') + 'px'" v-if="content.parserObj.options.get('previewLayout.multiple.spaceAfter')"></div>
		</template>
		<span v-if="valueType === 'fix' || valueType === 'editable'">&nbsp;</span>
	</div>
</template>

<script>
	// fxFunctions
	import GeoPreview from './fxFunctions/GeoPreview'

	export default {
		name: 'PreviewContent',
		props: {
			content: Object,
		},
		data () {
			return {
			}
		},
		computed: {
			valueType () {		// Ist der aktuelle Wert 'fix', 'editable' oder 'none'?
				if (this.content.parserObj && this.content.parserObj.options && this.content.parserObj.options.get('value')) {
					if (!this.content.parserObj.options.get('value.edit.use')) {
						return 'fix'
					}
					return 'editable'
				}
				return 'none'
			},
			layoutBase () {		// Mögliche Rückgabewerte: 'panel'/'panelClosed', 'justChilds', 'box', 'line' und 'inline'
				if (this.content.isRoot) { return 'justChilds' }
				if (this.content.parserObj && this.content.parserObj.options && this.content.parserObj.options.get('previewLayout.frame')) {
					if (this.content.parserObj.options.get('previewLayout.frame') === 'panelClosed') {
						this.isOpen = false
						return 'box'
					}
					return this.content.parserObj.options.get('previewLayout.frame')
				}
				return 'box'
			},
			title () {
				if (this.content.parserObj && this.content.parserObj.options) {
					if (this.content.parserObj.options.getResult('title')) {
						return this.content.parserObj.options.getResult('title')
					} else if (this.content.parserObj.options.get('tagAsTitle')) {
						return this.content.orgXmlObj.name
					}
				}
				return null
			},
			shownTitle () {
				if (this.content.parserObj && this.content.parserObj.options && !this.content.parserObj.options.get('previewLayout.hideTitle')) {
					return this.title
				}
				return null
			},
			enumerate () {
				if (this.content.parserObj && this.content.parserObj.options && this.content.isMultiple) {
					if (this.content.parserObj.options.get('previewLayout.multiple.enumerateFX')) {
						if (this.content.parserCopyDeep === 0) {
							return this.num2rom(this.content.multipleNr + 1) + '. '
						} else if (this.content.parserCopyDeep === 1) {
							return ' ' + (this.content.multipleNr + 1) + '. '
						} else if (this.content.parserCopyDeep === 2) {
							return ' ' + this.num2abc(this.content.multipleNr + 1) + ') '
						} else if (this.content.parserCopyDeep >= 3) {
							return ' ' + this.num2abc(this.content.multipleNr + 1, 'α', 25) + ') '
						}
					}
					if (this.content.parserObj.options.get('previewLayout.multiple.enumerateRom')) {
						return this.num2rom(this.content.multipleNr + 1) + '. '
					}
					if (this.content.parserObj.options.get('previewLayout.multiple.enumerate')) {
						return this.content.multipleNr + 1 + '. '
					}
				}
			},
		},
		watch: {
		},
		methods: {
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
			num2abc (num, char = 'a', max = 26) {		// Alphabetische Zahlen
				var bChar = (char).charCodeAt(0)
				var abc = ''
				do {
					num -= 1
					abc = String.fromCharCode(bChar + (num % max)) + abc
					num = (num / max) >> 0
				} while (num > 0)
				return abc
			},
			showObj (obj) {		// Soll das Element angezeigt werden?
				if (obj && obj.orgXmlObj
				&& (obj.parserObj && obj.parserObj.ready && obj.parserObj.useable)
				&& (obj.orgXmlObj.type === 'TEXT' || obj.orgXmlObj.type === 'ELEMENT')
				&& !(obj.parserObj.options && obj.parserObj.options.get('previewLayout.hidden'))) {
					return true
				}
				return false
			},
		},
		components: {
			GeoPreview
		},
	}
</script>

<style scoped>
	.inline {
		display: inline;
	}
	.enumerate, .enumeraterom {
		font-weight: bold;
	}
	.obj.lb-inline {
		display: inline;
	}
	.obj.lb-hide {
		display: none;
	}
</style>
