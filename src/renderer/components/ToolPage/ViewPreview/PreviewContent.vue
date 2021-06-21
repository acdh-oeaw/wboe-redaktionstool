<template>
  <div
    :id="'po' + content.uId"
    class="inline prel"
    :style="fontSize ? 'font-size: ' + fontSize + '%;' : null"
  >
    <template v-if="!hideWithoutContentAll">
      <!-- Vor Inhalten -->
      <div
        v-if="this.content.count > 0 && cParserObj && cParserOptionsGet('previewLayout.newlineIfNotFirst')"/>
      <div
        v-if="cParserObj && cParserOptionsGet('previewLayout.spaceTopBefore')"
        :style="{ height: cParserOptions.getOption('previewLayout.spaceTopBefore') + 'px' }" />
      <div
        v-if="cParserObj && cParserOptionsGet('previewLayout.headerTop')"
        v-text="cParserOptions.getOption('previewLayout.headerTop')"
        :class="'h' + (cParserOptions.getOption('previewLayout.headerTopSize') || 4)" />
      <template v-if="!hideWithoutContentTop">
        <template v-if="content.isMultiple && content.multipleNr === 0 && cParserObj && cParserOptionsGet('previewLayout.multiple.use')">
          <div
            v-if="cParserOptions.getOption('previewLayout.multiple.spaceBefore')"
            :style="{ height:  cParserOptions.getOption('previewLayout.multiple.spaceBefore') + 'px'}" />
          <div
            v-if="cParserOptions.getOption('previewLayout.multiple.header')"
            v-text="cParserOptions.getOption('previewLayout.multiple.header')"
            :class="'h' + (cParserOptions.getOption('previewLayout.multiple.headerSize') || 4)" />
          <span
            v-if="multipleBefore"
            v-text="multipleBefore"
            class="before" />
        </template>
        <div
          v-if="cParserObj && cParserOptionsGet('previewLayout.spaceBefore')"
          :style="{ height: cParserOptions.getOption('previewLayout.spaceBefore') + 'px' }" />
        <div
          v-if="cParserObj && cParserOptionsGet('previewLayout.header')"
          :class="'h' + (cParserOptions.getOption('previewLayout.headerSize') || 4)"
          v-text="cParserOptions.getOption('previewLayout.header')" />
        <span
          v-if="before" 
          class="before"
          v-text="before" />
        <template v-if="showAttributeBefore">
          <span :class="'inline-attr layout-' + (iaVal.class || 'attr')" v-for="(iaVal, iaKey) in showAttributeBefore" :key="'ia' + iaKey">
            <template v-if="content.orgXmlObj && content.orgXmlObj.attributes && content.orgXmlObj.attributes[iaKey]">
              <span class="before" v-if="iaVal.before">{{ iaVal.before }}</span>
              <span class="title" v-if="!iaVal.hideTitle">{{ iaVal.title || attrKey }}</span>
              <template v-if="iaVal.fx === 'valWoHt'">
                {{ content.orgXmlObj.attributes[iaKey].indexOf('#') === 0 ? content.orgXmlObj.attributes[iaKey].substring(1) : content.orgXmlObj.attributes[iaKey] }}
              </template>
              <template v-else>
                {{ content.orgXmlObj.attributes[iaKey] }}
              </template>
              <span class="before" v-if="iaVal.after">{{ iaVal.after }}</span>
            </template>
          </span>
        </template>
        <!-- Inhalte -->
        <!-- justChilds -->
        <div
          :id="'pox' + content.uId"
          :class="{
            'obj'               : true,
            'enumerated-childs' : enumeratedChilds.length > 1,
            'enumerated'        : enumerate && !(cParserOptions.getOption('layout.multiple.enumerateFX') === 'gt1' && content.multipleNr === 0 && content.multipleLast),
            'just-childs'       : true,
            'warnings'          : content.warnings.length > 0
          }"
          :data-target="hasTarget"
          v-if="layoutBase === 'justChilds'">
          <span
            v-if="enumerate"
            v-text="enumerate + ' '"
            :class="{
              'enumerate'     : true,
              'enumerate-gt1' : cParserOptions.getOption('layout.multiple.enumerateFX') === 'gt1' && content.multipleNr === 0 && content.multipleLast,
              'enumeraterom'  : cParserOptions.getOption('previewLayout.multiple.enumerateRom'),
              'deeper'        : content.parserCopyDeep >= 3
            }"
          />
          <!-- Kinder -->
          <template v-if="content.childs.length > 0 && !(cParserObj && cParserOptions && childlessFxFunctions.indexOf(cParserOptions.getOption('editor.fxFunction.name')) > -1)">
            <PreviewContent
              :geo-store="geoStore"
              ref="childs"
              :content="aContent"
              :commentsListe="commentsListe"
              :showAnchors="showAnchors"
              :showComments="showComments"
              @setAnchor="setAnchorX"
              :selectableAnchors="selectableAnchors"
              v-for="(aContent) in contentChildsShown"
              :key="'ccs' + aContent.uId"
            />
          </template>
        </div>
        <!-- normal -->
        <div
          :class="{
            obj                  : true,
            'enumerated-childs'  : enumeratedChilds.length > 1,
            'enumerated'         : enumerate && !(cParserOptions.getOption('layout.multiple.enumerateFX') === 'gt1' && content.multipleNr === 0 && content.multipleLast),
            ['lb-' + layoutBase] : true,
            warnings             : content.warnings.length > 0,
            hasanchor            : showAnchors && hasAnchor,
            hasselanchor         : selectableAnchors && hasAnchor,
            hascomment           : hasComment && showComments
          }"
          :data-target="hasTarget"
          @click="setAnchor"
          v-else>
          <div
            :id="'pox' + content.uId"
            v-bind="additionalAttributs"
            class="inline rel">
            <span
              v-text="enumerate + ' '"
              :class="{
                'enumerate'                      : true,
                'enumerate-gt1'                  : (cParserOptions.getOption('layout.multiple.enumerateFX') === 'gt1' && content.multipleNr === 0 && content.multipleLast),
                'enumeratefx'                    : this.cParserOptions.getOption('previewLayout.multiple.enumerateFX'),
                ['deep' + content.parserCopyDeep]: this.cParserOptions.getOption('previewLayout.multiple.enumerateFX')
              }"
              v-if="enumerate" />
            <b
              v-if="shownTitle"
              v-text="shownTitle + ': '"
              />
            <br v-if="shownTitle && layoutBase === 'box'"/>
            <!-- Inhalt -->
            <span
              v-if="valueType === 'fix' || valueType === 'editable'"
              v-text="content.orgXmlObj.getValueByOption(this.cParserOptions.getOption('value'), false)"
              :class="{
                'val-fix'   : valueType === 'fix',
                'bold'      : cParserOptions.getOption('previewLayout.bold'),
                'italic'    : cParserOptions.getOption('previewLayout.italic'),
                'underline' : cParserOptions.getOption('previewLayout.underline'),
                'ls1pt'     : cParserOptions.getOption('previewLayout.ls1pt')
              }" />
            <span
              :id="'gs' + content.uId"
              v-html="renderingGeoPreview(content, geoStore)"
              v-else-if="cParserObj && cParserOptionsGet('editor.fxFunction.name') === 'GeoSelect'"
            />
          </div>
          <!-- Kinder -->
          <template v-if="content.childs.length > 0 && !(cParserObj && cParserOptions && childlessFxFunctions.indexOf(cParserOptions.getOption('editor.fxFunction.name')) > -1)">
            <PreviewContent
              :geo-store="geoStore"
              ref="childs"
              :content="aContent"
              :commentsListe="commentsListe"
              :showAnchors="showAnchors"
              :showComments="showComments"
              @setAnchor="setAnchorX"
              :selectableAnchors="selectableAnchors"
              v-for="(aContent, aKey) in contentChildsShown"
              :key="aContent.uId + '-' + aKey"
            />
          </template>
        </div>

        <!-- Nach Inhalten -->
        <template v-if="showAttributeAfter">
          <span :class="'inline-attr layout-' + (iaVal.class || 'attr')" v-for="(iaVal, iaKey) in showAttributeAfter" :key="'ia' + iaKey">
            <template v-if="content.orgXmlObj && content.orgXmlObj.attributes && content.orgXmlObj.attributes[iaKey]">
              <span class="before" v-if="iaVal.before">{{ iaVal.before }}</span>
              <span class="title" v-if="!iaVal.hideTitle">{{ iaVal.title || attrKey }}</span>
              <template v-if="iaVal.fx === 'valWoHt'">
                {{ content.orgXmlObj.attributes[iaKey].indexOf('#') === 0 ? content.orgXmlObj.attributes[iaKey].substring(1) : content.orgXmlObj.attributes[iaKey] }}
              </template>
              <template v-else>
                {{ content.orgXmlObj.attributes[iaKey] }}
              </template>
              <span class="before" v-if="iaVal.after">{{ iaVal.after }}</span>
            </template>
          </span>
        </template>
        <span
          class="join"
          v-if="content.isMultiple && !content.multipleLast && cParserObj && cParserOptions.getOption('previewLayout.multiple.use') && cParserOptions.getOption('previewLayout.multiple.join')"
          v-text="(cParserOptions.getOption('previewLayout.multiple.lastjoin') && content.multipleNr === content.multipleMax - 1) ? cParserOptions.getOption('previewLayout.multiple.lastjoin') : cParserOptions.getOption('previewLayout.multiple.join')" />
        <span
          class="after"
          v-if="after"
          v-text="after" />
        <div
          class="h4"
          v-text="cParserOptions.getOption('previewLayout.footer')"
          v-if="cParserObj && cParserOptionsGet('previewLayout.footer')" />
        <div
          :style="{ height: cParserOptions.getOption('previewLayout.spaceAfter') + 'px'}"
          v-if="cParserObj && cParserOptionsGet('previewLayout.spaceAfter')" />
        <template v-if="content.isMultiple && content.multipleLast && cParserObj && cParserOptions.getOption('previewLayout.multiple.use')">
          <span
            class="after"
            v-if="multipleAfter"
            v-text="multipleAfter" />
          <br v-if="cParserOptions.getOption('previewLayout.multiple.lastBR')" />
          <div
            class="h4"
            v-text="cParserOptions.getOption('previewLayout.multiple.footer')"
            v-if="cParserOptions.getOption('previewLayout.multiple.footer')" />
          <div
            :style="{ height: cParserOptions.getOption('previewLayout.multiple.spaceAfter') + 'px'}"
            v-if="cParserOptions.getOption('previewLayout.multiple.spaceAfter')" />
        </template>
        <span
          v-if="whitespaceAfter" 
          v-text="' '" />
      </template>
    </template>
    <b-tooltip
      v-if="showAnchors && hasAnchor"
      :target="'po' + content.uId"
      placement="left"
      triggers="hover">
      {{ '#' + valAnchor + ' (' + typAnchor + ((subTypAnchor) ? ', ' + subTypAnchor : '') + ')' + ' -> ' + content.orgXmlObj.getValue()[0] }}
    </b-tooltip>
    <b-tooltip
      v-if="hasComment && showComments"
      :target="'pox' + content.uId"
      placement="top"
      triggers="hover">
      <ul class="comment-list">
        <li
          class="comment"
          v-for="(aComment, aComKey) in content.orgXmlObj.comments" :key="'cott' + content.uId + '-' + aComKey">
          {{ aComment.val }}
        </li>
      </ul>
    </b-tooltip>
    <span
      v-if="hasComment && showComments"
      class="comment-sym">
      <font-awesome-icon :icon="faComment" />
    </span>
  </div>
</template>

<script>
  import { BTooltip } from 'bootstrap-vue'
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
  import { faComment } from '@fortawesome/free-solid-svg-icons/faComment'
  import renderingPreview from './renderingPreview'

  export default {
    name: 'PreviewContent',
    props: {
      geoStore: {
        required: false,
        type: Object,
        default: () => {}
      },
      content: Object,
      fx: Object,
      showAnchors: Boolean,
      showComments: Boolean,
      selectableAnchors: Boolean,
      commentsListe: Object
    },
    data () {
      return {
        faComment,
        childlessFxFunctions: [
          'GeoSelect'
        ],
        pSubtypes: [
          'compound',
          'MWE',
          'diminutive',
          'movierung',
          'shortform'
        ],
      }
    },
    mounted () {
      this.updateComments()
    },
    computed: {
      before () {
        if (!this.fxC.noBefore && this.cParserObj && this.cParserOptions) {
          if (this.cParserOptions.getOption('previewLayout.beforeIfNotFirst')) {
            return this.content.count > 0 ? this.cParserOptions.getOption('previewLayout.beforeIfNotFirst') : null
          }
          let aOptBI = this.cParserOptions.getOption('previewLayout.beforeIf')
          if (aOptBI && aOptBI.id) {
            let aPrev = this.content.getSiblings('prev', true, false, true)[0]
            console.log('xxxx', aOptBI.id)
            if (aPrev && (typeof aOptBI.id === 'string' ? aPrev.parserObj.options.getOption('id') === aOptBI.id : aOptBI.id.indexOf(aPrev.parserObj.options.getOption('id')) > -1)) {
              return aOptBI.value
            }
          }
          return this.cParserOptions.getOption('previewLayout.before')
        } else {
          return null
        }
      },
      after () {
          if (!this.fxC.noAfter && this.cParserObj && this.cParserOptions) {
            let aOptAI = this.cParserOptions.getOption('previewLayout.afterIf')
            if (aOptAI && aOptAI.id) {
              let aNext = this.content.getSiblings('next', true, false, true)[0]
              if (aNext && (typeof aOptAI.id === 'string' ? aNext.parserObj.options.getOption('id') === aOptAI.id : aOptAI.id.indexOf(aNext.parserObj.options.getOption('id')) > -1)) {
                return aOptAI.value
              }
            }
            return this.cParserOptions.getOption('previewLayout.after')
          } else {
            return null
          }
      },
      multipleBefore () {
        if (!this.fxC.noBefore) {
          let aOptBI = this.cParserOptions.getOption('previewLayout.multiple.beforeIf')
          if (aOptBI && aOptBI.id) {
            let aPrev = this.content.getSiblings('prev', true, false, true)[0]
            if (aPrev && (typeof aOptBI.id === 'string' ? aPrev.parserObj.options.getOption('id') === aOptBI.id : aOptBI.id.indexOf(aPrev.parserObj.options.getOption('id')) > -1)) {
              return aOptBI.value
            }
          }
          return this.cParserOptions.getOption('previewLayout.multiple.before')
        } else {
          return null
        }
      },
      multipleAfter () {
        if (!this.fxC.noBefore) {
          let aOptAI = this.cParserOptions.getOption('previewLayout.multiple.afterIf')
          if (aOptAI && aOptAI.id) {
            let aNext = this.content.getSiblings('next', true, false, true)[0]
            if (aNext && (typeof aOptAI.id === 'string' ? aNext.parserObj.options.getOption('id') === aOptAI.id : aOptAI.id.indexOf(aNext.parserObj.options.getOption('id')) > -1)) {
              return aOptAI.value
            }
          }
          return this.cParserOptions.getOption('previewLayout.multiple.after')
        } else {
          return null
        }
      },
      whitespaceAfter () {
        function indexFor (arr, value) {
          for (let i = 0; i < arr.length; i++) {
            if (arr[i] === value) {
              return i
            }
          }
          return -1
        }
        function getFirstLetterAfter (arr) {
          for (let i = 0; i < arr.length; i++) {
            let x = arr[i]
            if (x.orgXmlObj.getValue) {
              let v = x.orgXmlObj.getValue()
              if (v && v.length > 0) {
                let vt = v.join(' ').trim()
                if (vt.length > 0) {
                  return vt
                }
              }
            }
          }
          return ''
        }
        let wsA = (!this.cParserOptions.getOption('previewLayout.noSpaceAfter') && (this.valueType === 'fix' || this.valueType === 'editable')) || this.cParserOptions.getOption('previewLayout.shoudSpace')
        if (wsA) {
          let ix = indexFor(this.content.root.family, this.content) // Slow
          let allAfter = this.content.root.family.slice(ix + 1)
          allAfter = allAfter.filter(x => x && x.parents && indexFor(x.parents.indexOf, this.content) > -1) // slow ?
          if (wsA && allAfter.length > 0 && allAfter[0].parserObj.options.getOption('previewLayout.prevAutospace')) {
            if (['-', '('].indexOf(this.content.orgXmlObj.getValue()[0].slice(-1)) > -1 || ['-', '('].indexOf(allAfter[0].orgXmlObj.getValue()[0][0]) > -1) {
              wsA = false
            }
            // console.log(allAfter[0], this.content.orgXmlObj.getValue()[0], allAfter[0].orgXmlObj.getValue()[0][0])
          }
          if (wsA && this.cParserOptions.getOption('previewLayout.autospace') && ix > -1) {
            let firstTextAfter = getFirstLetterAfter(allAfter)
            if (firstTextAfter.length > 0) {
              if (['.', ',', ';', ':', '-', ')'].indexOf(firstTextAfter[0]) > -1) {
                wsA = false
              }
              // console.log('firstTextAfter', this.content.uId, '"' + this.content.orgXmlObj.getValue()[0] + '"', wsA, ['.', ',', ';', ':', '-', ')'].indexOf(firstTextAfter[0]), this.content, [firstTextAfter[0], firstTextAfter])
            }
          }
        }
        return wsA
      },
      enumeratedChilds () {
        let aEnumChilds = this.contentChildsShown.filter(aChild => aChild && aChild.parserObj && aChild.parserObj.options && aChild.parserObj.options.getOption('previewLayout.multiple.enumerateFX'))
        return aEnumChilds
      },
      showAttributeBefore () {
        return this.content.parserObj.options && this.content.parserObj.options.getOption('previewLayout.showAttributeBefore')
      },
      showAttributeAfter () {
        return this.content.parserObj.options && this.content.parserObj.options.getOption('previewLayout.showAttributeAfter')
      },
      additionalAttributs () {
        let addAttr = this.cParserOptions.getOption('previewLayout.addAttribute')
        if (addAttr && addAttr.attribute) {
          // console.log('additionalAttributs', addAttr)
          let val = true
          if (addAttr.sourceAttribute && this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes[addAttr.sourceAttribute]) {
            val = this.content.orgXmlObj.attributes[addAttr.sourceAttribute]
            if (addAttr.removePrefix) {
              let rPrefix = this.cParserOptions.getOption('attributes.' + addAttr.sourceAttribute + '.prefix')
              if (rPrefix) {
                if (val.indexOf(rPrefix) === 0) {
                  val = val.substr(rPrefix.length)
                }
              }
              // console.log('additionalAttributs', addAttr.sourceAttribute, rPrefix, val)
            }
          }
          return {[addAttr.attribute]: val}
        }
        return null
      },
      fontSize () {
        return this.cParserOptions && this.cParserOptions.getOption('layout.fontsize')
      },
      hasComment () {
        return this.content.orgXmlObj && this.content.orgXmlObj.comments && this.content.orgXmlObj.comments.length > 0
      },
      fxC () {
        return this.fx || {}
      },
      hideWithoutContentAll () {
        return !this.cParserOptions.getOption('previewLayout.spaceTopBefore') && !this.cParserOptions.getOption('previewLayout.headerTopSize') && this.content.childs.length === 0 && this.cParserOptions.getOption('previewLayout.hideWithoutContent')
      },
      hideWithoutContentTop () {
        return this.content.childs.length === 0 && this.cParserOptions.getOption('previewLayout.hideWithoutContent')
      },
      cParserObj () {
        return this.content.parserObj
      },
      cParserOptions () {
        return this.content.parserObj.options
      },
      hasTarget () {
        let tg = this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes['target']
        return tg
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
        if (this.cParserObj && this.cParserOptions && this.cParserOptions.getOption('value')) {
          if (!this.cParserOptions.getOption('value.edit.use')) {
            return 'fix'
          }
          return 'editable'
        }
        return 'none'
      },
      layoutBase () {		// Mögliche Rückgabewerte: 'panel'/'panelClosed', 'justChilds', 'box', 'line' und 'inline'
        if (this.fx && this.fx.frame) { return this.fx.frame }
        if (this.content.isRoot) { return 'justChilds' }
        if (this.cParserObj && this.cParserOptions && this.cParserOptions.getOption('previewLayout.frame')) {
          if (this.cParserOptions.getOption('previewLayout.frame') === 'panelClosed') {
            this.isOpen = false
            return 'box'
          }
          return this.cParserOptions.getOption('previewLayout.frame')
        }
        return 'box'
      },
      title () {
        if (this.cParserObj && this.cParserOptions) {
          if (this.cParserOptions.getResult('title')) {
            return this.cParserOptions.getResult('title')
          } else if (this.cParserOptions.getOption('tagAsTitle')) {
            return this.content.orgXmlObj.name
          }
        }
        return null
      },
      shownTitle () {
        if (this.cParserObj && this.cParserOptions && !this.cParserOptions.getOption('previewLayout.hideTitle')) {
          return this.title
        }
        return null
      },
      enumerate () {
        if (this.cParserObj && this.cParserOptions && this.content.isMultiple) {
          if (this.cParserOptions.getOption('previewLayout.multiple.enumerateFX')) {
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
          if (this.cParserOptions.getOption('previewLayout.multiple.enumerateRom')) {
            return this.num2rom(this.content.multipleNr + 1) + '. '
          }
          if (this.cParserOptions.getOption('previewLayout.multiple.enumerate')) {
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
      'commentsListe.comments' (nVal) {
        this.updateComments()
      }
    },
    methods: {
      renderingGeoPreview: renderingPreview.geoPreview,
      cParserOptionsGet (opt) {
        return this.cParserOptions && this.cParserOptions.getOption(opt)
      },
      updateComments () {
        if (this.hasComment && this.commentsListe && this.commentsListe.comments && !this.commentsListe.comments[this.content.uId]) {
          this.$set(this.commentsListe.comments, this.content.uId, {
            list: this.content.orgXmlObj.comments,
            title: this.title,
            value: this.content.orgXmlObj.getValueByOption(this.cParserOptions.getOption('value'), false),
            el: this.$el,
            top: 0
          })
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
        if (obj && obj.orgXmlObj && obj.parents
        && (obj.parserObj && obj.parserObj.ready && obj.parserObj.useable)
        && (obj.orgXmlObj.type === 'TEXT' || obj.orgXmlObj.type === 'ELEMENT')
        && !(obj.parserObj.options && obj.parserObj.options.getOption('previewLayout.hidden'))) {
          if (obj.parserObj.options && obj.parserObj.options.getOption('previewLayout.fx')) {
            let aFx = obj.parserObj.options.getOption('previewLayout.fx')
            if (aFx === 'hideIfParentNextSame' || aFx === 'hideIfParentPrevSame') {
              let aParent = obj.parents[0]
              let nParent = obj.parents[0].getSiblings(aFx === 'hideIfParentPrevSame' ? 'prev' : 'next', true, false, true)[0]
              if (nParent && aParent.parserObj === nParent.parserObj) {
                let nObj = nParent.childs.filter(aObj => aObj.parserObj === obj.parserObj)
                if (nObj[0] && obj.orgXmlObj.getXML() === nObj[0].orgXmlObj.getXML()) {
                  return false
                }
              }
            }
          }
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
      BTooltip,
      FontAwesomeIcon
    }
  }
</script>

<style scoped>
  .prel {
    position: relative;
  }
  .inline {
    display: inline;
  }
  .enumerate, .enumeraterom {
    font-weight: bold;
  }
  .enumerate-gt1 {
    display: none!important;
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
  .comment-sym {
    position: absolute;
    right: -5px;
    top: -9px;
    font-size: 10px;
    color: #666;
    pointer-events: none;
  }
  .comment-sym.comment-highlight {
    font-size: 20px;
    top: -21px;
    right: -13px;
    color: #ef4921;
  }
  .rel {
		position: relative;
	}
	dl.dots > dt {
		display: list-item;
		list-style-type: disc;
	}
	body {
		font-family: 'Lato' !important;
	}
	.bold {
		font-weight: bold;
	}
	.italic {
		font-style: italic;
	}
	.underline {
		text-decoration: underline;
	}
	.ls1pt {
		letter-spacing: 1pt;
	}
	.hidden {
		display: none;
	}
	.scroll {
		overflow-x: auto;
		overflow-y: scroll;
  }
  .enumerated {
    display: block!important;
    margin-left: 30px;
  }
  .enumerated-childs > div > .enumerate {
    position: relative;
    height: 1px;
    display: inline-block;
    float: left;
    margin-right: 8px;
    min-width: 17px;
  }
  .enumerated:not(.enumerated-childs) {
    display: block;
    padding-left: 30px;
    min-height: 23px;
  }
  .enumerated:not(.enumerated-childs) > div > .enumerate {
    position: absolute;
    left: -30px;
  }
  .inline-attr.layout-right {
    float: right;
  }
</style>
