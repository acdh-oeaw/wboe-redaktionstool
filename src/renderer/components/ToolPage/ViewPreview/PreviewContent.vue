<template>
  <div
    :id="'po' + content.uId"
    :data-name="content.orgXmlObj && content.orgXmlObj.name ? content.orgXmlObj.name : '?'"
    :data-pid="$options && $options.cParserOptions && $options.cParserOptions.options && $options.cParserOptions.options.id ? $options.cParserOptions.options.id : '?'"
    class="inline prel"
    :style="$options.privateData.fontSize ? 'font-size: ' + $options.privateData.fontSize + '%;' : null"
  >
    <template v-if="!$options.privateData.hideWithoutContentAll">
      <!-- Vor Inhalten -->
      <div v-if="$options.privateData.topLineSpacer === 0 || $options.privateData.topLineSpacer > 0" :style="'height: ' + $options.privateData.topLineSpacer + 'px'" />
      <div v-if="$options.privateData.headerTop" v-text="$options.privateData.headerTop.text" :class="'h' + $options.privateData.headerTop.size"/>
      <template v-if="!$options.privateData.hideWithoutContentTop">
        <template v-if="$options.privateData.isFirstMultiple && $options.privateData.isFirstMultipleContent">
          <div
            v-if="$options.cParserOptions.getOption('previewLayout.multiple.spaceBefore')"
            :style="'height: ' + $options.cParserOptions.getOption('previewLayout.multiple.spaceBefore') + 'px'"
          />
          <div
            v-if="$options.cParserOptions.getOption('previewLayout.multiple.header')"
            v-text="$options.cParserOptions.getOption('previewLayout.multiple.header')"
            :class="'h' + ($options.cParserOptions.getOption('previewLayout.multiple.headerSize') || 4)"
          />
          <span
            v-if="$options.privateData.multipleBefore"
            v-text="$options.privateData.multipleBefore"
            class="before"
          />
        </template>
        <div v-if="$options.cParserOptions.spaceBefore" :style="'height: ' + $options.cParserOptions.spaceBefore + 'px'" />
        <div
          v-if="cParserOptionsGet('previewLayout.header')"
          :class="'h' + ($options.cParserOptions.getOption('previewLayout.headerSize') || 4)"
          v-text="$options.cParserOptions.getOption('previewLayout.header')"
        />
        <span
          v-if="$options.privateData.before" 
          class="before"
          v-text="$options.privateData.before"
        />
        <template v-if="$options.privateData.showAttributeBefore">
          <span :class="'inline-attr layout-' + (iaVal.class || 'attr')" v-for="(iaVal, iaKey) in $options.privateData.showAttributeBefore" :key="'ia' + iaKey">
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
          :class="
            'obj just-childs'
            + ($options.enumeratedChilds.length > 1 ? ' enumerated-childs' : '')
            + ($options.privateData.enumerate && !($options.cParserOptions.getOption('layout.multiple.enumerateFX') === 'gt1' && content.multipleNr === 0 && content.multipleLast) ? ' enumerated' : '')
            + (content.warnings.length > 0 ? ' warnings' : '')
          "
          :data-target="$options.privateData.hasTarget"
          v-if="$options.privateData.layoutBase === 'justChilds'"
        >
          <span
            v-if="$options.privateData.enumerate"
            v-text="$options.privateData.enumerate + ' '"
            :class="
              'enumerate'
              + ($options.cParserOptions.getOption('layout.multiple.enumerateFX') === 'gt1' && content.multipleNr === 0 && content.multipleLast ? ' enumerate-gt1' : '')
              + ($options.cParserOptions.getOption('previewLayout.multiple.enumerateRom') ? ' enumeraterom' : '')
              + (content.parserCopyDeep >= 3 ? ' deeper' : '')
            "
          />
          <!-- Kinder -->
          <template v-if="content.childs.length > 0 && !($options.cParserOptions && $options.privateData.childlessFxFunctions.indexOf($options.cParserOptions.getOption('editor.fxFunction.name')) > -1)">
            <PreviewContent
              :geo-store="geoStore"
              ref="childs"
              :content="aContent"
              :commentsListe="commentsListe"
              :showAnchors="showAnchors"
              :showComments="showComments"
              @setAnchor="setAnchorX"
              :selectableAnchors="selectableAnchors"
              v-for="(aContent) in $options.contentChildsShown"
              :key="'ccs' + aContent.uId"
            />
          </template>
        </div>
        <!-- normal -->
        <div
          :class="
            'obj lb-' + $options.privateData.layoutBase
            + ($options.enumeratedChilds.length > 1 ? ' enumerated-childs' : '')
            + ($options.privateData.enumerate && !($options.cParserOptions.getOption('layout.multiple.enumerateFX') === 'gt1' && content.multipleNr === 0 && content.multipleLast) ? ' enumerated' : '')
            + (content.warnings.length > 0 ? ' warnings' : '')
            + (showAnchors && $options.privateData.hasAnchor ? ' hasanchor' : '')
            + (selectableAnchors && $options.privateData.hasAnchor ? ' hasselanchor' : '')
            + (showComments && $options.privateData.hasComment ? ' hascomment' : '')
          "
          :data-target="$options.privateData.hasTarget"
          @click="setAnchor"
          v-else
        >
          <div
            :id="'pox' + content.uId"
            v-bind="$options.privateData.additionalAttributs"
            class="inline rel"
          >
            <span
              v-text="$options.privateData.enumerate + ' '"
              :class="
                'enumerate'
                + ($options.cParserOptions.getOption('layout.multiple.enumerateFX') === 'gt1' && content.multipleNr === 0 && content.multipleLast ? ' enumerate-gt1' : '')
                + ($options.cParserOptions.getOption('previewLayout.multiple.enumerateFX') ? ' enumeratefx deep' + content.parserCopyDeep : '')
              "
              v-if="$options.privateData.enumerate"
            />
            <template v-if="$options.privateData.shownTitle">
              <b v-text="$options.privateData.shownTitle + ': '" />
              <br v-if="$options.privateData.layoutBase === 'box'" />
            </template>
            <!-- Inhalt -->
            <span
              v-if="$options.privateData.valueType === 'fix' || $options.privateData.valueType === 'editable'"
              v-text="content.orgXmlObj.getValueByOption($options.cParserOptions.getOption('value'), false)"
              :class="$options.cParserOptions.getPreviewFontStyles() + ($options.privateData.valueType === 'fix' ? ' val-fix' : '')"
            />
            <span
              :id="'gs' + content.uId"
              v-html="renderingGeoPreview(content, geoStore)"
              v-else-if="cParserOptionsGet('editor.fxFunction.name') === 'GeoSelect'"
            />
          </div>
          <!-- Kinder -->
          <template v-if="content.childs.length > 0 && !($options.cParserOptions && $options.privateData.childlessFxFunctions.indexOf($options.cParserOptions.getOption('editor.fxFunction.name')) > -1)">
            <PreviewContent
              :geo-store="geoStore"
              ref="childs"
              :content="aContent"
              :commentsListe="commentsListe"
              :showAnchors="showAnchors"
              :showComments="showComments"
              @setAnchor="setAnchorX"
              :selectableAnchors="selectableAnchors"
              v-for="(aContent, aKey) in $options.contentChildsShown"
              :key="aContent.uId + '-' + aKey"
            />
          </template>
        </div>

        <!-- Nach Inhalten -->
        <template v-if="$options.privateData.showAttributeAfter">
          <span :class="'inline-attr layout-' + (iaVal.class || 'attr')" v-for="(iaVal, iaKey) in $options.privateData.showAttributeAfter" :key="'ia' + iaKey">
            <template v-if="content.orgXmlObj && content.orgXmlObj.attributes && content.orgXmlObj.attributes[iaKey]">
              <span class="$options.privateData.before" v-if="iaVal.before">{{ iaVal.before }}</span>
              <span class="title" v-if="!iaVal.hideTitle">{{ iaVal.title || attrKey }}</span>
              <template v-if="iaVal.fx === 'valWoHt'">
                {{ content.orgXmlObj.attributes[iaKey].indexOf('#') === 0 ? content.orgXmlObj.attributes[iaKey].substring(1) : content.orgXmlObj.attributes[iaKey] }}
              </template>
              <template v-else>
                {{ content.orgXmlObj.attributes[iaKey] }}
              </template>
              <span class="$options.privateData.before" v-if="iaVal.after">{{ iaVal.after }}</span>
            </template>
          </span>
        </template>
        <span
          class="join"
          v-if="content.isMultiple && !content.multipleLast && $options.cParserOptions.getOption('previewLayout.multiple.use') && $options.cParserOptions.getOption('previewLayout.multiple.join')"
          v-text="($options.cParserOptions.getOption('previewLayout.multiple.lastjoin') && content.multipleNr === content.multipleMax - 1) ? $options.cParserOptions.getOption('previewLayout.multiple.lastjoin') : $options.cParserOptions.getOption('previewLayout.multiple.join')"
        />
        <span
          class="after"
          v-if="$options.privateData.after"
          v-text="$options.privateData.after"
        />
        <div
          class="h4"
          v-text="$options.cParserOptions.getOption('previewLayout.footer')"
          v-if="cParserOptionsGet('previewLayout.footer')"
        />
        <div
          :style="'height: ' + $options.cParserOptions.getOption('previewLayout.spaceAfter') + 'px'"
          v-if="cParserOptionsGet('previewLayout.spaceAfter')"
        />
        <template v-if="$options.privateData.isLastMultiple && $options.privateData.isLastMultipleContent">
          <span
            v-if="$options.privateData.multipleAfter"
            v-text="$options.privateData.multipleAfter"
            class="after"
          />
          <br v-if="$options.cParserOptions.getOption('previewLayout.multiple.lastBR')" />
          <div
            v-if="$options.cParserOptions.getOption('previewLayout.multiple.footer')"
            v-text="$options.cParserOptions.getOption('previewLayout.multiple.footer')"
            class="h4"
          />
          <div
            v-if="$options.cParserOptions.getOption('previewLayout.multiple.spaceAfter')"
            :style="'height: ' + $options.cParserOptions.getOption('previewLayout.multiple.spaceAfter') + 'px'"
          />
        </template>
        <span
          v-if="$options.privateData.whitespaceAfter" 
          v-text="' '"
        />
      </template>
    </template>
    <b-tooltip
      v-if="showAnchors && $options.privateData.hasAnchor"
      :target="'po' + content.uId"
      placement="left"
      triggers="hover"
    >
      {{ '#' + $options.privateData.valAnchor + ' (' + $options.privateData.typAnchor + (($options.privateData.subTypAnchor) ? ', ' + $options.privateData.subTypAnchor : '') + ')' + ' -> ' + content.orgXmlObj.getValue()[0] }}
    </b-tooltip>
    <template v-if="showComments && $options.privateData.hasComment">
      <b-tooltip
        :target="'pox' + content.uId"
        placement="top"
        triggers="hover"
      >
        <ul class="comment-list">
          <li
            class="comment"
            v-for="(aComment, aComKey) in content.orgXmlObj.comments" :key="'cott' + content.uId + '-' + aComKey"
          >
            {{ aComment.val }}
          </li>
        </ul>
      </b-tooltip>
      <span class="comment-sym">
        <font-awesome-icon :icon="faComment" />
      </span>
    </template>
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
      }
    },
    cParserOptions: null,
    contentChildsShown: [],
    enumeratedChilds: false,
    privateData: {
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
      fxC: {},
      hideWithoutContentAll: false,
      fontSize: null,
      before: null,
      after: null,
      multipleBefore: null,
      multipleAfter: null,
      whitespaceAfter: null,
      hasComment: false,
      showAttributeBefore: false,
      showAttributeAfter: false,
      additionalAttributs: null,
      hideWithoutContentTop: false,
      hasTarget: false,
      hasAnchor: false,
      valAnchor: '',
      typAnchor: '',
      subTypAnchor: '',
      valueType: 'none',
      layoutBase: 'box',
      title: null,
      shownTitle: null,
      enumerate: null
    },
    created () {
      var aThis = this
      if (this.content.parserObj) {
        this.$options.cParserOptions = this.content.parserObj.options
      }
      this.$options.privateData.valueType = (this.$options.cParserOptions && this.$options.cParserOptions.getOption('value'))
          ? ((!this.$options.cParserOptions.getOption('value.edit.use')) ? 'fix' : 'editable')
          : 'none'
      this.$options.privateData.fxC = this.fx || {}
      this.$options.privateData.fontSize = this.$options.cParserOptions && this.$options.cParserOptions.getOption('layout.fontsize')
      this.$options.privateData.hideWithoutContentAll = this.content.childs.length === 0 && !this.$options.cParserOptions.getOption('previewLayout.spaceTopBefore') && !this.$options.cParserOptions.getOption('previewLayout.headerTopSize') && this.$options.cParserOptions.getOption('previewLayout.hideWithoutContent')
      this.$options.privateData.before = (function () {
          if (!aThis.$options.privateData.fxC.noBefore && aThis.$options.cParserOptions) {
            if (aThis.$options.cParserOptions.getOption('previewLayout.beforeIfNotFirst')) {
              return aThis.content.count > 0 ? aThis.$options.cParserOptions.getOption('previewLayout.beforeIfNotFirst') : null
            }
            let aOptBI = aThis.$options.cParserOptions.getOption('previewLayout.beforeIf')
            if (aOptBI && aOptBI.id) {
              let aPrev = aThis.content.getSiblings('prev', true, false, true)[0]
              console.log('xxxx', aOptBI.id)
              if (aPrev && (typeof aOptBI.id === 'string' ? aPrev.parserObj.options.getOption('id') === aOptBI.id : aOptBI.id.indexOf(aPrev.parserObj.options.getOption('id')) > -1)) {
                return aOptBI.value
              }
            }
            return aThis.$options.cParserOptions.getOption('previewLayout.before')
          } else {
            return null
          }
        }())
      this.$options.privateData.after = (function () {
          if (!aThis.$options.privateData.fxC.noAfter && aThis.$options.cParserOptions) {
            let aOptAI = aThis.$options.cParserOptions.getOption('previewLayout.afterIf')
            if (aOptAI && aOptAI.id) {
              let aNext = aThis.content.getSiblings('next', true, false, true)[0]
              if (aNext && (typeof aOptAI.id === 'string' ? aNext.parserObj.options.getOption('id') === aOptAI.id : aOptAI.id.indexOf(aNext.parserObj.options.getOption('id')) > -1)) {
                return aOptAI.value
              }
            }
            return aThis.$options.cParserOptions.getOption('previewLayout.after')
          } else {
            return null
          }
        }())
      this.$options.privateData.multipleBefore = (function () {
          if (!aThis.$options.privateData.fxC.noBefore) {
            let aOptBI = aThis.$options.cParserOptions.getOption('previewLayout.multiple.beforeIf')
            if (aOptBI && aOptBI.id) {
              let aPrev = aThis.content.getSiblings('prev', true, false, true)[0]
              if (aPrev && (typeof aOptBI.id === 'string' ? aPrev.parserObj.options.getOption('id') === aOptBI.id : aOptBI.id.indexOf(aPrev.parserObj.options.getOption('id')) > -1)) {
                return aOptBI.value
              }
            }
            return aThis.$options.cParserOptions.getOption('previewLayout.multiple.before')
          } else {
            return null
          }
        }())
      this.$options.privateData.multipleAfter = (function () {
          if (!aThis.$options.privateData.fxC.noBefore) {
            let aOptAI = aThis.$options.cParserOptions.getOption('previewLayout.multiple.afterIf')
            if (aOptAI && aOptAI.id) {
              let aNext = aThis.content.getSiblings('next', true, false, true)[0]
              if (aNext && (typeof aOptAI.id === 'string' ? aNext.parserObj.options.getOption('id') === aOptAI.id : aOptAI.id.indexOf(aNext.parserObj.options.getOption('id')) > -1)) {
                return aOptAI.value
              }
            }
            return aThis.$options.cParserOptions.getOption('previewLayout.multiple.after')
          } else {
            return null
          }
        }())
      this.$options.privateData.whitespaceAfter = (function () {
          function indexFor (arr, value) {
            for (let i = 0, aLen = arr.length; i < aLen; i++) {
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
          let wsA = (!aThis.$options.cParserOptions.getOption('previewLayout.noSpaceAfter') && (aThis.$options.privateData.valueType === 'fix' || aThis.$options.privateData.valueType === 'editable')) || aThis.$options.cParserOptions.getOption('previewLayout.shoudSpace')
          if (wsA) {
            if (aThis.$options.cParserOptions.getOption('previewLayout.noSpaceAfterHyphen')) {
              if (['-'].indexOf(aThis.content.orgXmlObj.getValue()[0].slice(-1)) > -1) {
                wsA = false
              }
            } else {
              let ix = indexFor(aThis.content.root.family, aThis.content)
              let allAfter = aThis.content.root.family.slice(ix + 1)
              let fullAllAfter = allAfter.filter(x => x && (!x.parents || !(indexFor(x.parents, aThis.content) > -1)))
              // allAfter = allAfter.filter(x => x && x.parents && indexFor(x.parents, aThis.content) > -1)
              if (fullAllAfter.length > 0 && fullAllAfter[0].parserObj.options.getOption('previewLayout.prevAutospace')) {
                if (['-', '(', '[', '{', '<', '}'].indexOf(aThis.content.orgXmlObj.getValue()[0].slice(-1)) > -1 || ['-', '(', '[', '{', '<'].indexOf(fullAllAfter[0].orgXmlObj.getValue()[0][0]) > -1) {
                  wsA = false
                }
              }
              if (wsA && aThis.$options.cParserOptions.getOption('previewLayout.autospace') && ix > -1) {
                // let firstTextAfter = getFirstLetterAfter(allAfter)
                let fullFirstTextAfter = getFirstLetterAfter(fullAllAfter)
                // console.log('firstTextAfter', (aThis.content.orgXmlObj && aThis.content.orgXmlObj.name ? aThis.content.orgXmlObj.name : '?'), aThis.$options.cParserOptions.options.id && aThis.content.orgXmlObj && aThis.content.orgXmlObj.name ? aThis.content.orgXmlObj.name : '?', fullFirstTextAfter, {fullAllAfter})
                if (fullFirstTextAfter.length > 0) {
                  if (['.', ',', ';', ':', '-', ')', ']', '}', '>'].indexOf(fullFirstTextAfter[0]) > -1) {
                    wsA = false
                  }
                }
              }
            }
          }
          return wsA
        }())
      this.$options.privateData.hasComment = this.content.orgXmlObj && this.content.orgXmlObj.comments && this.content.orgXmlObj.comments.length > 0
      this.$options.privateData.showAttributeBefore = this.content.parserObj.options && this.content.parserObj.options.getOption('previewLayout.showAttributeBefore')
      this.$options.privateData.showAttributeAfter = this.content.parserObj.options && this.content.parserObj.options.getOption('previewLayout.showAttributeAfter')
      this.$options.privateData.additionalAttributs = (function () {
          let addAttr = aThis.$options.cParserOptions.getOption('previewLayout.addAttribute')
          if (addAttr && addAttr.attribute) {
            let val = true
            if (addAttr.sourceAttribute && aThis.content.orgXmlObj && aThis.content.orgXmlObj.attributes && aThis.content.orgXmlObj.attributes[addAttr.sourceAttribute]) {
              val = aThis.content.orgXmlObj.attributes[addAttr.sourceAttribute]
              if (addAttr.removePrefix) {
                let rPrefix = aThis.$options.cParserOptions.getOption('attributes.' + addAttr.sourceAttribute + '.prefix')
                if (rPrefix) {
                  if (val.indexOf(rPrefix) === 0) {
                    val = val.substr(rPrefix.length)
                  }
                }
              }
            }
            return {[addAttr.attribute]: val}
          }
          return null
        }())
      this.$options.privateData.hideWithoutContentTop = this.content.childs.length === 0 && this.$options.cParserOptions.getOption('previewLayout.hideWithoutContent')
      this.$options.privateData.hasTarget = this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes.target
      this.$options.privateData.hasAnchor = (this.content.orgXmlObj && this.content.orgXmlObj.attributes && (
          this.content.orgXmlObj.attributes['xml:id']
          || ((this.content.orgXmlObj.attributes.subtype && this.$options.privateData.pSubtypes.indexOf(this.content.orgXmlObj.attributes.subtype) > -1)
            && !(this.content.orgXmlObj && this.content.orgXmlObj.name === 'xr'))
        ))
      this.$options.privateData.valAnchor = (this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes['xml:id']) ? this.content.orgXmlObj.attributes['xml:id'] : ''
      this.$options.privateData.typAnchor = ((this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes.type && this.$options.privateData.pSubtypes.indexOf(this.content.orgXmlObj.attributes.type) > -1))
          ? this.content.orgXmlObj.attributes.type
          : ((this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes['xml:id']) ? 'lemma' : 'variant')
      // console.log(this.$options.privateData.typAnchor, this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes['xml:id'], this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes.type && this.$options.privateData.pSubtypes.indexOf(this.content.orgXmlObj.attributes.type) > -1)
      this.$options.privateData.subTypAnchor = ((this.content.orgXmlObj && this.content.orgXmlObj.attributes && this.content.orgXmlObj.attributes.subtype && this.$options.privateData.pSubtypes.indexOf(this.content.orgXmlObj.attributes.subtype) > -1))
          ? this.content.orgXmlObj.attributes.subtype : ''
      this.$options.privateData.layoutBase = (function () { // Mögliche Rückgabewerte: 'panel'/'panelClosed', 'justChilds', 'box', 'line' und 'inline'
          if (aThis.fx && aThis.fx.frame) { return aThis.fx.frame }
          if (aThis.content.isRoot) { return 'justChilds' }
          if (aThis.$options.cParserOptions && aThis.$options.cParserOptions.getOption('previewLayout.frame')) {
            if (aThis.$options.cParserOptions.getOption('previewLayout.frame') === 'panelClosed') {
              aThis.isOpen = false
              return 'box'
            }
            return aThis.$options.cParserOptions.getOption('previewLayout.frame')
          }
          return 'box'
        }())
      this.$options.privateData.title = (this.$options.cParserOptions)
          ? (this.$options.cParserOptions.getResult('title')
            ? this.$options.cParserOptions.getResult('title')
            : ((this.$options.cParserOptions.getOption('tagAsTitle')) ? this.content.orgXmlObj.name : null))
          : null
      this.$options.privateData.shownTitle = (this.$options.cParserOptions && !this.$options.cParserOptions.getOption('previewLayout.hideTitle')) ? this.title : null
      this.$options.contentChildsShown = this.content.childs.filter((aObj) => this.showObj(aObj))
      this.$options.enumeratedChilds = this.$options.contentChildsShown.filter(aChild => aChild && aChild.parserObj && aChild.parserObj.options && aChild.parserObj.options.getOption('previewLayout.multiple.enumerateFX'))
      this.$options.privateData.enumerate = (function () {
          if (aThis.$options.cParserOptions && aThis.content.isMultiple) {
            if (aThis.$options.cParserOptions.getOption('previewLayout.multiple.enumerateFX')) {
              if (aThis.content.parserCopyDeep === 0) {
                return aThis.num2rom(aThis.content.multipleNr + 1) + '. '
              } else if (aThis.content.parserCopyDeep === 1) {
                return ' ' + (aThis.content.multipleNr + 1) + '. '
              } else if (aThis.content.parserCopyDeep === 2) {
                return ' ' + aThis.num2abc(aThis.content.multipleNr + 1) + ') '
              } else if (aThis.content.parserCopyDeep >= 3) {
                return ' ' + aThis.num2abc(aThis.content.multipleNr + 1, 'α', 25) + ') '
              }
            }
            if (aThis.$options.cParserOptions.getOption('previewLayout.multiple.enumerateRom')) {
              return aThis.num2rom(aThis.content.multipleNr + 1) + '. '
            }
            if (aThis.$options.cParserOptions.getOption('previewLayout.multiple.enumerate')) {
              return aThis.content.multipleNr + 1 + '. '
            }
          }
        }())
      this.$options.privateData.topLineSpacer = (this.content.count > 0 && this.$options.cParserOptions && this.$options.cParserOptions.getOption('previewLayout.newlineIfNotFirst'))
          ? 0
          : (this.$options.cParserOptions && this.$options.cParserOptions.getOption('previewLayout.spaceTopBefore')) || null
      this.$options.privateData.spaceBefore = this.$options.cParserOptions && this.$options.cParserOptions.getOption('previewLayout.spaceBefore')
      this.$options.privateData.headerTop = this.$options.cParserOptions && this.$options.cParserOptions.getOption('previewLayout.headerTop')
          ? { text: this.$options.cParserOptions.getOption('previewLayout.headerTop'), size: (this.$options.cParserOptions.getOption('previewLayout.headerTopSize') || 4) } : null
      this.$options.privateData.isFirstMultiple = this.content.isMultiple && this.content.multipleNr === 0 && this.$options.cParserOptions && this.$options.cParserOptions.getOption('previewLayout.multiple.use')
      this.$options.privateData.isFirstMultipleContent = this.$options.privateData.multipleBefore || (this.$options.cParserOptions && (this.$options.cParserOptions.getOption('previewLayout.multiple.spaceBefore') || this.$options.cParserOptions.getOption('previewLayout.multiple.header')))
      this.$options.privateData.isLastMultiple = this.content.isMultiple && this.content.multipleLast && this.$options.cParserOptions && this.$options.cParserOptions.getOption('previewLayout.multiple.use')
      this.$options.privateData.isLastMultipleContent = this.$options.privateData.multipleAfter || (this.$options.cParserOptions && (this.$options.cParserOptions.getOption('previewLayout.multiple.lastBR') || this.$options.cParserOptions.getOption('previewLayout.multiple.footer') || this.$options.cParserOptions.getOption('previewLayout.multiple.spaceAfter')))
      this.$options.privateData = JSON.parse(JSON.stringify(this.$options.privateData))
      // console.log('this.$options', this.$options)
    },
    mounted () {
      this.updateComments()
    },
    computed: {
    },
    watch: {
      'commentsListe.comments' (nVal) {
        this.updateComments()
      }
    },
    methods: {
      renderingGeoPreview: renderingPreview.geoPreview,
      cParserOptionsGet (opt) {
        return this.$options.cParserOptions && this.$options.cParserOptions.getOption(opt)
      },
      updateComments () {
        if (this.$options.privateData.hasComment && this.commentsListe && this.commentsListe.comments && !this.commentsListe.comments[this.content.uId]) {
          this.$set(this.commentsListe.comments, this.content.uId, {
            list: this.content.orgXmlObj.comments,
            title: this.title,
            value: this.content.orgXmlObj.getValueByOption(this.$options.cParserOptions.getOption('value'), false),
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
          && !(obj.parserObj.options && obj.parserObj.options.getOption('previewLayout.hidden'))
        ) {
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
        if (this.selectableAnchors && this.$options.privateData.hasAnchor) {
          console.log(this.content.orgXmlObj.getValue()[0], this.$options.privateData.valAnchor, this.$options.privateData.typAnchor, this.$options.privateData.subTypAnchor)
          this.$emit('setAnchor', [this.content.orgXmlObj.getValue()[0], this.$options.privateData.valAnchor, this.$options.privateData.typAnchor, this.$options.privateData.subTypAnchor])
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
