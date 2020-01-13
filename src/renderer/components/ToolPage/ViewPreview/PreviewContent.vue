<template>
  <div :id="'po' + content.uId"
       :class="'inline'"
       :title="((valAnchor || subTypAnchor) ? '#' + valAnchor + ' (' + typAnchor + ((subTypAnchor) ? ', ' + subTypAnchor : '') + ')' + ' -> ' + content.orgXmlObj.getValue()[0] : '')"
       v-b-tooltip.hover.left
       :style="'font-size: ' + ((cParserObj && cParserOptions && cParserOptions.get('previewLayout.fontsize')) ? cParserOptions.get('previewLayout.fontsize') : 100) + '%;'"
       >
    <template v-if="!hideWithoutContentAll">
      <!-- Vor Inhalten -->
      <div :style="'height: ' + cParserOptions.get('previewLayout.spaceTopBefore') + 'px'" v-if="cParserObj && cParserOptions && cParserOptions.get('previewLayout.spaceTopBefore')"></div>
      <div :class="'h' + (cParserOptions.get('previewLayout.headerTopSize') || 4)" v-if="cParserObj && cParserOptions && cParserOptions.get('previewLayout.headerTop')">{{ cParserOptions.get('previewLayout.headerTop') }}</div>

      <template v-if="!hideWithoutContentTop">
        <template v-if="content.isMultiple && content.multipleNr === 0 && cParserObj && cParserOptions && cParserOptions.get('previewLayout.multiple.use')">
          <div :style="'height: ' + cParserOptions.get('previewLayout.multiple.spaceBefore') + 'px'" v-if="cParserOptions.get('previewLayout.multiple.spaceBefore')"></div>
          <div :class="'h' + (cParserOptions.get('previewLayout.multiple.headerSize') || 4)" v-if="cParserOptions.get('previewLayout.multiple.header')">{{ cParserOptions.get('previewLayout.multiple.header') }}</div>
          <span class="before" v-if="!fxC.noBefore && cParserOptions.get('previewLayout.multiple.before')">{{ cParserOptions.get('previewLayout.multiple.before') }}</span>
        </template>

        <div :style="'height: ' + cParserOptions.get('previewLayout.spaceBefore') + 'px'" v-if="cParserObj && cParserOptions && cParserOptions.get('previewLayout.spaceBefore')"></div>
        <div :class="'h' + (cParserOptions.get('previewLayout.headerSize') || 4)" v-if="cParserObj && cParserOptions && cParserOptions.get('previewLayout.header')">{{ cParserOptions.get('previewLayout.header') }}</div>
        <span class="before" v-if="!fxC.noBefore && cParserObj && cParserOptions && cParserOptions.get('previewLayout.before')">{{ cParserOptions.get('previewLayout.before') }}</span>

        <!-- Inhalte -->
        <!-- justChilds -->
        <div :class="{'obj': true, 'just-childs': true, 'warnings': content.warnings.length > 0}" v-if="layoutBase === 'justChilds'">
          <span :class="{'enumerate': true, 'enumeraterom': cParserOptions.get('previewLayout.multiple.enumerateRom'), 'deeper': (content.parserCopyDeep >= 3)}" v-if="enumerate">{{ enumerate }}&nbsp;</span>
          <!-- Kinder -->
          <template v-if="content.childs.length > 0 && !(cParserObj && cParserOptions && childlessFxFunctions.indexOf(cParserOptions.get('editor.fxFunction.name')) > -1)">
            <PreviewContent ref="childs" :content="aContent" :showAnchors="showAnchors" @setAnchor="setAnchorX" :selectableAnchors="selectableAnchors"
              v-for="(aContent, aKey) in contentChildsShown"
              :key="aContent.uId + '-' + aKey"
            />
          </template>
        </div>
        <!-- normal -->
        <div :class="'obj lb-' + layoutBase + ((content.warnings.length > 0) ? ' warnings' : '')
                    + ((showAnchors && hasAnchor) ? ' hasanchor' : '')
                    + ((selectableAnchors && hasAnchor) ? ' hasselanchor' : '')
                  "
          @click="setAnchor"
          v-else>
          <div class="inline rel">
            <span :class="'enumerate' + ((this.cParserOptions.get('previewLayout.multiple.enumerateFX'))?' enumeratefx deep' + content.parserCopyDeep:'')" v-if="enumerate">{{ enumerate }}&nbsp;</span>
            <b v-if="shownTitle">{{ shownTitle }}: </b><br v-if="shownTitle && layoutBase === 'box'"/>
            <!-- Inhalt -->
            <span :class="{ 'val-fix': valueType === 'fix',
                            'bold': cParserOptions.get('previewLayout.bold'),
                            'italic': cParserOptions.get('previewLayout.italic'),
                            'underline': cParserOptions.get('previewLayout.underline'),
                            'ls1pt': cParserOptions.get('previewLayout.ls1pt')
                          }"
                  v-if="valueType === 'fix' || valueType === 'editable'">{{ content.orgXmlObj.getValueByOption(this.cParserOptions.get('value'), false) }}</span>
            <GeoPreview :content="content" v-else-if="cParserObj && cParserOptions && cParserOptions.get('editor.fxFunction.name') === 'GeoSelect'"/>
          </div>
          <!-- Kinder -->
          <template v-if="content.childs.length > 0 && !(cParserObj && cParserOptions && childlessFxFunctions.indexOf(cParserOptions.get('editor.fxFunction.name')) > -1)">
            <PreviewContent ref="childs" :content="aContent" :showAnchors="showAnchors" @setAnchor="setAnchorX" :selectableAnchors="selectableAnchors"
              v-for="(aContent, aKey) in contentChildsShown"
              :key="aContent.uId + '-' + aKey"
            />
          </template>
        </div>

        <!-- Nach Inhalten -->
        <span class="join" v-if="content.isMultiple && !content.multipleLast && cParserObj && cParserOptions.get('previewLayout.multiple.use') && cParserOptions.get('previewLayout.multiple.join')">{{ cParserOptions.get('previewLayout.multiple.join') }}</span>

        <span class="after" v-if="!fxC.noAfter && cParserObj && cParserOptions && cParserOptions.get('previewLayout.after')">{{ cParserOptions.get('previewLayout.after') }}</span>
        <div class="h4" v-if="cParserObj && cParserOptions && cParserOptions.get('previewLayout.footer')">{{ cParserOptions.get('previewLayout.footer') }}</div>
        <div :style="'height: ' + cParserOptions.get('previewLayout.spaceAfter') + 'px'" v-if="cParserObj && cParserOptions && cParserOptions.get('previewLayout.spaceAfter')"></div>

        <template v-if="content.isMultiple && content.multipleLast && cParserObj && cParserOptions.get('previewLayout.multiple.use')">
          <span class="after" v-if="!fxC.noAfter && cParserOptions.get('previewLayout.multiple.after')">{{ cParserOptions.get('previewLayout.multiple.after') }}</span>
          <br v-if="cParserOptions.get('previewLayout.multiple.lastBR')"/>
          <div class="h4" v-if="cParserOptions.get('previewLayout.multiple.footer')">{{ cParserOptions.get('previewLayout.multiple.footer') }}</div>
          <div :style="'height: ' + cParserOptions.get('previewLayout.multiple.spaceAfter') + 'px'" v-if="cParserOptions.get('previewLayout.multiple.spaceAfter')"></div>
        </template>
        <span v-if="!cParserOptions.get('previewLayout.noSpaceAfter') && (valueType === 'fix' || valueType === 'editable')">&nbsp;</span>
      </template>
    </template>
  </div>
</template>

<script>
  // fxFunctions
  import GeoPreview from './fxFunctions/GeoPreview'

  export default {
    name: 'PreviewContent',
    props: {
      content: Object,
      fx: Object,
      showAnchors: Boolean,
      selectableAnchors: Boolean,
    },
    data () {
      return {
        childlessFxFunctions: ['GeoSelect'],
        pSubtypes: ['compound', 'MWE', 'diminutive', 'movierung', 'shortform'],
      }
    },
    computed: {
      fxC () {
        return this.fx || {}
      },
      hideWithoutContentAll () {
        return !this.cParserOptions.get('previewLayout.spaceTopBefore') && !this.cParserOptions.get('previewLayout.headerTopSize') && this.content.childs.length === 0 && this.cParserOptions.get('previewLayout.hideWithoutContent')
      },
      hideWithoutContentTop () {
        return this.content.childs.length === 0 && this.cParserOptions.get('previewLayout.hideWithoutContent')
      },
      cParserObj () {
        return this.content.parserObj
      },
      cParserOptions () {
        return this.content.parserObj.options
      },
      hasAnchor () {
        let hA = (this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes['xml:id'])
              || ((this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes['subtype'] && this.pSubtypes.indexOf(this.content.orgXmlObj.attributes['subtype']) > -1)
                && !(this.content.orgXmlObj && this.content.orgXmlObj.name === 'xr'))
        return hA
      },
      valAnchor () {
        if (this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes['xml:id']) {
          return this.content.orgXmlObj.attributes['xml:id']
        }
        return ''
      },
      typAnchor () {
        if ((this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes['type'] && this.pSubtypes.indexOf(this.content.orgXmlObj.attributes['type']) > -1)) {
          return this.content.orgXmlObj.attributes['type']
        }
        if (this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes['xml:id']) {
          return 'lemma'
        } else {
          return 'variant'
        }
      },
      subTypAnchor () {
        if ((this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes['subtype'] && this.pSubtypes.indexOf(this.content.orgXmlObj.attributes['subtype']) > -1)) {
          return this.content.orgXmlObj.attributes['subtype']
        }
        return ''
      },
      valueType () {		// Ist der aktuelle Wert 'fix', 'editable' oder 'none'?
        if (this.cParserObj && this.cParserOptions && this.cParserOptions.get('value')) {
          if (!this.cParserOptions.get('value.edit.use')) {
            return 'fix'
          }
          return 'editable'
        }
        return 'none'
      },
      layoutBase () {		// Mögliche Rückgabewerte: 'panel'/'panelClosed', 'justChilds', 'box', 'line' und 'inline'
        if (this.fx && this.fx.frame) { return this.fx.frame }
        if (this.content.isRoot) { return 'justChilds' }
        if (this.cParserObj && this.cParserOptions && this.cParserOptions.get('previewLayout.frame')) {
          if (this.cParserOptions.get('previewLayout.frame') === 'panelClosed') {
            this.isOpen = false
            return 'box'
          }
          return this.cParserOptions.get('previewLayout.frame')
        }
        return 'box'
      },
      title () {
        if (this.cParserObj && this.cParserOptions) {
          if (this.cParserOptions.getResult('title')) {
            return this.cParserOptions.getResult('title')
          } else if (this.cParserOptions.get('tagAsTitle')) {
            return this.content.orgXmlObj.name
          }
        }
        return null
      },
      shownTitle () {
        if (this.cParserObj && this.cParserOptions && !this.cParserOptions.get('previewLayout.hideTitle')) {
          return this.title
        }
        return null
      },
      enumerate () {
        if (this.cParserObj && this.cParserOptions && this.content.isMultiple) {
          if (this.cParserOptions.get('previewLayout.multiple.enumerateFX')) {
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
          if (this.cParserOptions.get('previewLayout.multiple.enumerateRom')) {
            return this.num2rom(this.content.multipleNr + 1) + '. '
          }
          if (this.cParserOptions.get('previewLayout.multiple.enumerate')) {
            return this.content.multipleNr + 1 + '. '
          }
        }
      },
      contentChildsShown () {
        let aOut = []
        this.content.childs.forEach((aObj) => {
          if (this.showObj(aObj)) {
            aOut.push(aObj)
          }
        })
        return aOut
      }
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
      setAnchor () {
        if (this.selectableAnchors && this.hasAnchor) {
          this.$emit('setAnchor', [this.content.orgXmlObj.getValue()[0], this.valAnchor, this.typAnchor, this.subTypAnchor])
        }
      },
      setAnchorX (data) {
        this.$emit('setAnchor', data)
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
  .hasanchor {
    background: rgba(0, 0, 255, 0.11);
  }
  .selanchor {
    background: rgba(0, 255, 0, 0.25);
  }
  .hasselanchor {
    cursor: pointer;
  }
  .hasselanchor:hover {
    background: rgba(0, 0, 255, 0.11);
  }
  .h1, .h2, .h3, .h4, .h5, .h6 {
    margin-top: 10px;
  }
  .h1:first-child, .h2:first-child, .h3:first-child, .h4:first-child, .h5:first-child, .h6:first-child {
    margin-top: 0px;
  }
</style>
