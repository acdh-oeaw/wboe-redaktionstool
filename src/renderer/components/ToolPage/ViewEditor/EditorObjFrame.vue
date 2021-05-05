<template>
  <div :id="'eo' + content.uId" :class="'inline' + ((this.DragNdrop.dragUid === this.content.uId) ? ' dragobj' : '') + ((isDragTarget) ? ' dragtarget' : '') + ((dragDir) ? ' dragpos-' + dragDir : '')"
      :style="fontSize ? 'font-size: ' + fontSize + '%;' : null"
      :draggable="isDraggable"
      @mouseenter="mouseEnter"
      @mouseleave="mouseLeave"
      v-on:dragstart="dragStart"
      v-on:dragend="dragEnd"
      v-on:dragleave="dragLeave"
      v-on:dragover="dragOver"
      v-on:drop="drop"
    >
    <!-- Vor Inhalten -->
    <div v-if="this.content.count > 0 && cParserObj && cParserOptionsGet('layout.newlineIfNotFirst')"/>
    <div :style="'height: ' + cParserOptions.getOption('layout.spaceTopBefore') + 'px'" v-if="cParserOptionsGet('layout.spaceTopBefore')"></div>
    <div :class="'h' + (cParserOptions.getOption('layout.headerTopSize') || 4)" @contextmenu.prevent="contextMenue" v-if="cParserOptionsGet('layout.headerTop')">{{ cParserOptions.getOption('layout.headerTop') }}</div>

    <template v-if="content.isMultiple && content.multipleNr === 0 && cParserOptionsGet('layout.multiple.use')">
      <div :style="'height: ' + cParserOptions.getOption('layout.multiple.spaceBefore') + 'px'" v-if="cParserOptions.getOption('layout.multiple.spaceBefore')"></div>
      <div :class="'h' + (cParserOptions.getOption('layout.multiple.headerSize') || 4)" @contextmenu.prevent="contextMenue" v-if="cParserOptions.getOption('layout.multiple.header')">{{ cParserOptions.getOption('layout.multiple.header') }}</div>
      <span class="before" v-if="cParserOptions.getOption('layout.multiple.before')">{{ cParserOptions.getOption('layout.multiple.before') }}</span>
    </template>

    <div :style="'height: ' + cParserOptions.getOption('layout.spaceBefore') + 'px'" v-if="cParserOptionsGet('layout.spaceBefore')"></div>
    <div :class="'h' + (cParserOptions.getOption('layout.headerSize') || 4)" @contextmenu.prevent="contextMenue" v-if="cParserOptionsGet('layout.header')">{{ cParserOptions.getOption('layout.header') }}</div>
    <span class="before" v-if="cParserOptionsGet('layout.before') && !cParserOptions.getOption('layout.fxPreview')">{{ cParserOptions.getOption('layout.before') }}</span>


    <!-- Inhalte -->
    <div :class="'obj just-childs' + (content.warnings.length > 0 ? ' warnings' : '') + (hasComment ? ' has-comment' + (Options.show.commentsHighlight ? ' comment-highlight' : '') : '')" v-if="layoutBase === 'justChilds'">
      <span :class="
                'enumerate' + 
                ((cParserOptions.getOption('layout.multiple.enumerateFX') === 'gt1' && content.multipleNr === 0 && content.multipleLast) ? ' enumerate-gt1' : '') +
                ((content.parserCopyDeep >= 3) ? ' deeper' : '')
            " v-if="enumerate" @contextmenu.prevent="contextMenue">{{ enumerate }}&nbsp;</span>
      <slot name="childs" />		<!-- Kinder -->
      <slot name="after" />
    </div>

    <b-card :class="'obj paneldecent mitb5' + (content.warnings.length > 0 ? ' warnings' : '') + (hasComment ? ' has-comment' + (Options.show.commentsHighlight ? ' comment-highlight' : '') : '')" v-else-if="layoutBase === 'panel'" no-body>
      <div @contextmenu.prevent="contextMenue" slot="header">
        <button v-b-toggle="'collapse-' + _uid" class="header-btn-toggle">
          <span :class="
                    'enumerate' +
                    ((cParserOptions.getOption('layout.multiple.enumerateFX') === 'gt1' && content.multipleNr === 0 && content.multipleLast) ? ' enumerate-gt1' : '') +
                    (content.parserCopyDeep >= 3 ? ' deeper' : '')
                " v-if="enumerate">{{ enumerate }}&nbsp;</span>
          <span><b>{{ title }}</b>&nbsp;</span>
          <font-awesome-icon :icon="((isOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/>
        </button>
        <span :class="'comment-sym' + (Options.show.commentsHighlight ? ' comment-highlight' : '')" v-if="hasComment"><font-awesome-icon icon="comment"/></span>		<!-- Kommentar -->
      </div>
      <b-collapse v-model="isOpen" :id="'collapse-' + _uid" class="fxcollapse">
        <b-list-group @contextmenu.prevent="contextMenue" flush v-if="content.addableInner.length > 0">
          <b-list-group-item style="background: #eee;">
            <div style="margin: -8px -9px;">
              <b-button @click="addTag(aVal.uId, 'In')" size="sm" :variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))" class="mir5"
                v-for="(aVal, aKey) in contentAddableInnerBShow"
                :key="'bi' + aKey"
              >
                <font-awesome-icon icon="circle-notch" class="fa-icon"/> {{ aVal.title }}
              </b-button>
            </div>
          </b-list-group-item>
        </b-list-group>
        <b-card-body>
          <div @contextmenu.prevent="contextMenue" class="context rel">
            <slot/>		<!-- Inhalt -->
          </div>
          <slot name="childs"/>		<!-- Kinder -->
          <slot name="after"/>
        </b-card-body>
      </b-collapse>
      <div @contextmenu.prevent="contextMenue" slot="footer" style="margin: -8px -9px;" v-if="content.addableAfter.length > 0">
        <b-button @click="addTag(aVal.uId, 'After')" size="sm" :variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))" class="mir5"
          v-for="(aVal, aKey) in contentAddableAfterBShow"
          :key="'ba' + aKey"
        >
          <font-awesome-icon icon="plus" class="fa-icon"/>
          {{ aVal.title }}
        </b-button>
      </div>
    </b-card>

    <div :class="'obj lb-' + layoutBase + ((content.warnings.length > 0) ? ' warnings' : '') + (hasComment ? ' has-comment' + (Options.show.commentsHighlight ? ' comment-highlight' : '') : '')" v-else>
      <div @contextmenu.prevent="contextMenue" class="context rel">
        <span :class="
                  'enumerate' +
                  ((cParserOptions.getOption('layout.multiple.enumerateFX') === 'gt1' && content.multipleNr === 0 && content.multipleLast) ? ' enumerate-gt1' : '') +
                  ((content.parserCopyDeep >= 3) ? ' deeper' : '')
              " v-if="enumerate">{{ enumerate }}&nbsp;</span>
        <b v-if="shownTitle">{{ shownTitle }}:</b><br v-if="shownTitle && layoutBase === 'box'"/>
        <slot />		<!-- Inhalt -->
        <span :class="'comment-sym' + (Options.show.commentsHighlight ? ' comment-highlight' : '')" v-if="hasComment"><font-awesome-icon icon="comment"/></span>		<!-- Kommentar -->
      </div>
      <div @contextmenu.prevent="contextMenue" :class="'addable-in-btn' + (layoutBase !== 'box' ? ' inline' : '')"
            v-if="addableInButtons.length > 0">
        <div class="inline-block" @mouseenter="Options.options.addBtnHover ? showAddableButtons('In') : null" @mouseleave="Options.options.addBtnHover ? hideAddableButtons($event, 'In') : null">
          <b-button @click="Options.options.addBtnHover ? addTag(addableInButtons[0].uId, 'In') : showAddableButtons('In')" size="xs"
                    @focus="showAddableButtons('In')"
                    @blur="hideAddableButtons($event, 'In')"
                    ref="addableInButton"
                    class="btn-icon-circle-notch-white"
                    :variant="((addableInButtons[0].type === 'self') ? 'success' : ((addableInButtons[0].type === 'anywhere') ? 'secondary' : 'primary'))"
          />
          <div class="addable-in-btns" ref="addableInButtonsFrame" :style="'left:' + inAfterFrameLeft + 'px'" v-if="isOpenAdditionalAddInBtn && !this.DragNdrop.dragUid">
            <b-button @click="addTag(aVal.uId, 'In')" @blur="hideAddableButtons($event, 'In')" size="xs"
                      :variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))"
                      :class="(aKey === addableInButtons.length - 1 ? 'first' : null)"
                      :key="'aib' + aKey" ref="addableInButtons"	v-for="(aVal, aKey) in addableInButtons.slice().reverse()">
              <font-awesome-icon icon="circle-notch" class="fa-icon"/> {{ aVal.title }} <span :class="'shortcut' + (aVal.sort < 99999 ? ' sorted' : '')" v-if="addableInButtons.length - aKey < 10">{{ addableInButtons.length - aKey }}</span>
            </b-button>
          </div>
        </div>
      </div>
      <slot name="childs" />
      <slot name="after" />
      <div @contextmenu.prevent="contextMenue" :class="'addable-after-btn' + (layoutBase !== 'box' ? ' inline' : '')"
            v-if="addableAfterButtons.length > 0">
        <div class="inline-block" @mouseenter="Options.options.addBtnHover ? showAddableButtons('After') : null" @mouseleave="Options.options.addBtnHover ? hideAddableButtons($event, 'After') : null">
          <button @click="Options.options.addBtnHover ? addTag(addableAfterButtons[0].uId, 'After') : showAddableButtons('After')" size="xs"
                  @focus="showAddableButtons('After')"
                  @blur="hideAddableButtons($event, 'After')"
                  ref="addableAfterButton"
                  :class="'btn btn-icon-plus-white btn-' + ((addableAfterButtons[0].type === 'self') ? 'success' : ((addableAfterButtons[0].type === 'anywhere') ? 'secondary' : 'primary')) + ' btn-xs'"
          />
          <div class="addable-after-btns" ref="addableAfterButtonsFrame" :style="'left:' + inAfterFrameLeft + 'px'" v-if="isOpenAdditionalAddAfterBtn && !this.DragNdrop.dragUid">
            <b-button @click="addTag(aVal.uId, 'After')" @blur="hideAddableButtons($event, 'After')" size="xs"
                      :variant="((aVal.type === 'self') ? 'success' : ((aVal.type === 'anywhere') ? 'secondary' : 'primary'))"
                      :class="(aKey === addableAfterButtons.length - 1 ? 'first' : '')"
                      :key="'aab' + aKey" ref="addableAfterButtons"	v-for="(aVal, aKey) in addableAfterButtons.slice().reverse()">
              <font-awesome-icon icon="plus" class="fa-icon"/> {{ aVal.title }} <span :class="'shortcut' + (aVal.sort < 99999 ? ' sorted' : '')" v-if="addableAfterButtons.length - aKey < 10">{{ addableAfterButtons.length - aKey }}</span>
            </b-button>
          </div>
        </div>
      </div>
    </div>


    <!-- Nach Inhalten -->
    <span class="join" v-if="content.isMultiple && !content.multipleLast && cParserOptions.getOption('layout.multiple.use') && cParserOptions.getOption('layout.multiple.join')">
      {{ (cParserOptions.getOption('layout.multiple.lastjoin') && content.multipleNr === content.multipleMax - 1) ? cParserOptions.getOption('layout.multiple.lastjoin') : cParserOptions.getOption('layout.multiple.join') }}
    </span>

    <span class="after" v-if="cParserOptionsGet('layout.after') && !cParserOptions.getOption('layout.fxPreview')">{{ cParserOptions.getOption('layout.after') }}</span>
    <div class="h4" v-if="cParserOptionsGet('layout.footer')">{{ cParserOptions.getOption('layout.footer') }}</div>
    <div :style="'height: ' + cParserOptions.getOption('layout.spaceAfter') + 'px'" v-if="cParserOptionsGet('layout.spaceAfter')"></div>

    <template v-if="content.isMultiple && content.multipleLast && cParserOptions.getOption('layout.multiple.use')">
      <span class="after" v-if="cParserOptions.getOption('layout.multiple.after')">{{ cParserOptions.getOption('layout.multiple.after') }}</span>
      <br v-if="cParserOptions.getOption('layout.multiple.lastBR')"/>
      <div class="h4" v-if="cParserOptions.getOption('layout.multiple.footer')">{{ cParserOptions.getOption('layout.multiple.footer') }}</div>
      <div :style="'height: ' + cParserOptions.getOption('layout.multiple.spaceAfter') + 'px'" v-if="cParserOptions.getOption('layout.multiple.spaceAfter')"></div>
    </template>


    <!-- Kontext Menü -->
    <EditorContextMenu :content="content" @clickcomment="clickComment" ref="contextMenuEditor" v-if="contextMenuCached"/>

    <!-- Kommentare -->
    <b-modal ref="commentModal" title="Kommentare" @hidden="closeCommentModal" ok-only v-if="commentObj && commentObj.orgXmlObj">
      <b-input-group size="sm" class="my-3" :key="'co' + commentObj.uId + '-' + aComKey" v-for="(aComment, aComKey) in commentObj.orgXmlObj.comments">
        <b-form-input v-model="aComment.val"></b-form-input>
        <b-input-group-append>
          <b-btn @click="delComment(commentObj, aComKey)" variant="danger"><font-awesome-icon icon="trash-alt"/></b-btn>
        </b-input-group-append>
      </b-input-group>

      <b-input-group size="sm" class="my-3">
        <b-form-input v-model="commentNewVal"></b-form-input>
        <b-input-group-append>
          <b-btn @click="addComment(commentObj)" variant="primary" :disabled="!commentNewVal"><font-awesome-icon icon="plus"/></b-btn>
        </b-input-group-append>
      </b-input-group>

    </b-modal>
    <b-tooltip :target="'eo' + content.uId" placement="topright" triggers="hover" class="tooltipcomment" v-if="hasComment && Options.show.commentsHighlight">
      <ul class="comment-list">
        <li class="comment" v-for="(aComment, aComKey) in content.orgXmlObj.comments" :key="'cott' + content.uId + '-' + aComKey">
          {{ aComment.val }}
        </li>
      </ul>
    </b-tooltip>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import EditorContextMenu from './EditorContextMenu'

  export default {
    name: 'EditorObjFrame',
    props: {
      content: Object,
      view: Object
    },
    data () {
      return {
        'isOpen': true,
        'contextMenuCached': false,
        'isOpenAdditionalAddAfterBtn': false,
        'isOpenAdditionalAddInBtn': false,
        'commentObj': null,
        'commentNewVal': '',
        'dragDir': null,
        inAfterFrameLeft: 0
      }
    },
    mounted () {
      // console.log('x')
    },
    created () {
      window.addEventListener('keyup', this.keyUp)
    },
    beforeDestroy () {
      window.removeEventListener('keyup', this.keyUp)
    },
    methods: {
      keyUp (e) {
        if (this.isOpenAdditionalAddAfterBtn || this.isOpenAdditionalAddInBtn) {
          if (e.keyCode >= 49 && e.keyCode <= 57) {
            e.preventDefault()
            let aRef = this.$refs[this.isOpenAdditionalAddAfterBtn ? 'addableAfterButtons' : 'addableInButtons']
            if (aRef && aRef.length >= e.keyCode - 48) {
              let aBtn = aRef[aRef.length - (e.keyCode - 48)]
              // console.log(e.keyCode - 48, {x: aBtn})
              if (aBtn) {
                aBtn.click()
              }
            }
          }
        }
      },
      cParserOptionsGet (opt) {
        return this.cParserOptions && this.cParserOptions.getOption(opt)
      },
      isOpenAdditionalAddInAfterBtn (nVal, inAfter) {
        if (nVal) {
          this.inAfterFrameLeft = 0
          this.$nextTick(() => {
            let refAB = this.$refs[inAfter][this.$refs[inAfter].length - 1]
            if (refAB) {
              refAB.focus()
            }
            let vRight = this.view.$el.getBoundingClientRect().right + 15
            let fRight = this.$refs[inAfter + 'Frame'].getBoundingClientRect().right
            this.inAfterFrameLeft = fRight > vRight ? vRight - fRight : 0
          })
        }
      },
      dragStart (e) {
        e.stopPropagation()
        this.$store.commit('SET_DRAG_UID', this.content.uId)
        this.$store.commit('SET_DRAG_PARSER_UID', this.cParserObj.uId)
        var crt = this.$el.cloneNode(true)
        crt.classList.add('dragitem')
        crt.classList.add('delafterdrag')
        let aElement = null
        crt.childNodes.forEach(function (aChild) {
          if (aChild.nodeType === aChild.ELEMENT_NODE && aChild.classList.contains('obj')) {
            aElement = aChild
          }
        }, this)
        while (crt.firstChild) {
          crt.removeChild(crt.firstChild)
        }
        Array.prototype.forEach.call(aElement.querySelectorAll('.addable-after-btn, .addable-in-btn, svg'), function (node) {
          node.parentNode.removeChild(node)
        })
        crt.appendChild(aElement)
        document.body.appendChild(crt)
        e.dataTransfer.setDragImage(crt, 0, 30)
        e.dataTransfer.setData('uid', this.content.uId)
      },
      dragEnd (e) {
        this.$store.commit('SET_DRAG_UID', null)
        this.$store.commit('SET_DRAG_PARSER_UID', null)
        this.dragDir = null
        var paras = document.getElementsByClassName('delafterdrag')
        while (paras[0]) {
          paras[0].parentNode.removeChild(paras[0])
        }
      },
      dragLeave (e) {
        if (this.isDragTarget) {
          this.dragDir = null
        }
      },
      dragOver (e) {
        if (this.isDragTarget) {
          e.stopPropagation()
          e.preventDefault()
          this.dragDir = 'left'
          let aPos = e.target.closest('.dragtarget')
          if (aPos) {
            aPos = (aPos.getBoundingClientRect().left + aPos.offsetWidth / 2) - e.pageX
            if (aPos < 0) {
              this.dragDir = 'right'
            }
          }
        }
      },
      drop (e) {
        if (this.isDragTarget) {
          e.stopPropagation()
          this.dragDir = 'left'
          let aPos = e.target.closest('.dragtarget')
          if (aPos) {
            aPos = (aPos.getBoundingClientRect().left + aPos.offsetWidth / 2) - e.pageX
            if (aPos < 0) {
              this.dragDir = 'right'
            }
          }
          this.content.root.moveTo(parseInt(e.dataTransfer.getData('uid')), this.content.uId, this.dragDir)
          this.dragDir = null
        }
      },
      showAddableButtons (type) {
        this['isOpenAdditionalAdd' + type + 'Btn'] = true
      },
      hideAddableButtons (e, type) {
        if (e.type === 'blur') {
          let aEl = e.relatedTarget || document.activeElement
          if (this.$refs['addable' + type + 'Button'] === aEl || this.$refs['addable' + type + 'Buttons'].indexOf(aEl) > -1) {
            return false
          }
        }
        this['isOpenAdditionalAdd' + type + 'Btn'] = false
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
          this.content.addAfter(this.cParserObj.root.family[aParUId])
        } else if (type === 'In') {
          this.content.add(0, this.cParserObj.root.family[aParUId])
        }
      },
      clickComment (cObj) {
        this.commentObj = cObj
      },
      addComment (cObj) {
        if (this.commentNewVal.trim().length > 0) {
          cObj.orgXmlObj.comments.push({'val': this.commentNewVal.trim()})
          this.$store.dispatch('IS_CHANGED')
        }
        this.commentNewVal = ''
      },
      delComment (cObj, aKey) {
        if (confirm('Kommentar wirklich löschen?')) {
          cObj.orgXmlObj.comments.splice(aKey, 1)
          this.$store.dispatch('IS_CHANGED')
        }
      },
      closeCommentModal () {
        if (this.commentNewVal.trim().length > 0) {
          this.addComment(this.commentObj)
        }
        this.commentObj = null
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
      mouseEnter () {
        if (this.Options.show.tipLine) {
          let aTipLine = ''
          if (this.content && this.content.orgXmlObj && this.content.orgXmlObj.parents) {
            aTipLine += this.content.parents.slice(0).reverse().map(function (x) {
              return x.orgXmlObj.name + ' (' + x.parserObj.uId + ((x.parserObj.options && x.parserObj.options.getOption('id')) ? ', ' + x.parserObj.options.getOption('id') : '') + ')'
            }).slice(1).join(' -> ')
            aTipLine += ' -> ' + this.content.orgXmlObj.name + ' (' + this.cParserObj.uId + ((this.cParserOptionsGet('id')) ? ', ' + this.cParserOptions.getOption('id') : '') + ')'
          }
          this.$emit('setTipLine', aTipLine)
        }
      },
      mouseLeave () {
        if (this.Options.show.tipLine) {
          this.$emit('setTipLine', '')
        }
      },
    },
    computed: {
      ...mapState(['DragNdrop']),
      ...mapState(['Options']),
      fontSize () {
        return this.cParserOptions && this.cParserOptions.getOption('layout.fontsize')
      },
      hasComment () {
        return this.content.orgXmlObj && this.content.orgXmlObj.comments && this.content.orgXmlObj.comments.length > 0
      },
      cParserObj () {
        return this.content.parserObj
      },
      cParserOptions () {
        return this.content.parserObj.options
      },
      isDragTarget () {
        if (this.DragNdrop.dragUid) {
          if (this.$el && this.$el.closest('.dragobj')) {
            return false
          }
          return this.DragNdrop.dragUid !== this.content.uId && this.DragNdrop.dragParserUid === this.cParserObj.uId
        } else {
          return false
        }
      },
      isDraggable () {
        return this.content.isMultiple && this.cParserOptions && this.cParserOptions.getOption('editor.draggAble')
      },
      layoutBase () {		// Mögliche Rückgabewerte: 'panel'/'panelClosed', 'justChilds', 'box', 'line' und 'inline'
        if (this.content.isRoot) { return 'justChilds' }
        if (this.cParserOptions && this.cParserOptions.getOption('layout.frame')) {
          if (this.cParserOptions.getOption('layout.frame') === 'panelClosed') {
            this.isOpen = false
            return 'panel'
          }
          return this.cParserOptions.getOption('layout.frame')
        }
        return 'panel'
      },
      title () {
        if (this.cParserOptions) {
          if (this.cParserOptions.getResult('title')) {
            return this.cParserOptions.getResult('title')
          } else if (this.cParserOptions.getOption('tagAsTitle') || this.layoutBase === 'panel') {
            return this.content.orgXmlObj.name
          }
        }
        return null
      },
      shownTitle () {
        if (this.cParserOptions && !this.cParserOptions.getOption('layout.hideTitle')) {
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
        if (this.cParserOptions && this.content.isMultiple) {
          if (this.cParserOptions.getOption('layout.multiple.enumerateFX')) {
            if (this.content.parserCopyDeep === 0) {
              return this.num2rom(this.content.multipleNr + 1) + '. '
            } else if (this.content.parserCopyDeep === 1) {
              return this.content.multipleNr + 1 + '. '
            } else if (this.content.parserCopyDeep === 2) {
              return this.num2abc(this.content.multipleNr + 1) + ') '
            } else if (this.content.parserCopyDeep >= 3) {
              return this.num2abc(this.content.multipleNr + 1, 'α', 25) + ') '
            }
          }
          if (this.cParserOptions.getOption('layout.multiple.enumerateRom')) {
            return this.num2rom(this.content.multipleNr + 1) + '. '
          }
          if (this.cParserOptions.getOption('layout.multiple.enumerate')) {
            return this.content.multipleNr + 1 + '. '
          }
        }
      },
      contentAddableInnerBShow () {
        let aOut = []
        this.content.addableInner.forEach((aObj) => {
          if (aObj.bShow) {
            aOut.push(aObj)
          }
        })
        return aOut
      },
      contentAddableAfterBShow () {
        let aOut = []
        this.content.addableAfter.forEach((aObj) => {
          if (aObj.bShow) {
            aOut.push(aObj)
          }
        })
        return aOut
      }
    },
    watch: {
      'commentObj' (nVal) {
        if (nVal) {
          console.log(nVal)
          this.commentNewVal = ''
          this.$nextTick(() => {
            this.$refs.commentModal.show()
          })
        }
      },
      'isOpenAdditionalAddAfterBtn' (nVal) {
        this.isOpenAdditionalAddInAfterBtn(nVal, 'addableAfterButtons')
      },
      'isOpenAdditionalAddInBtn' (nVal) {
        this.isOpenAdditionalAddInAfterBtn(nVal, 'addableInButtons')
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
  .inline-block {
    display: inline-block;
    cursor: default;
  }

  .obj.lb-inline {
    display: inline;
    padding: 0px 3px;
  }
  .obj.lb-inline:hover {
    background: #eee;
  }
  .obj.lb-inline.warnings:hover {
    background: #ffe86c;
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
  .h1, .h2, .h3, .h4, .h5, .h6 {
    margin-top: 10px;
  }
  .h1:first-child, .h2:first-child, .h3:first-child, .h4:first-child, .h5:first-child, .h6:first-child {
    margin-top: 0px;
  }
  .enumerate {
    font-weight: bold;
  }
  .enumerate-gt1 {
    color: #bbb;
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
    position: relative;
    padding-right: 23px!important;
    display: block;
    width: 100%;
    margin: 3px 0;
    text-align: left;
    white-space: nowrap;
  }
  .addable-after-btns > button.first, .addable-in-btns > button.first {
    font-weight: bolder;
  }
  .shortcut {
    position: absolute;
    right: 2px;
    background: rgba(255,255,255,0.5);
    width: 13px;
    text-align: center;
    border-radius: 3px;
    color: #333;
  }
  .shortcut.sorted {
    font-weight: bold;
    color: #111;
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
  .card.obj.has-comment.comment-highlight > .card-header, .obj.has-comment.comment-highlight {
    background-color: #ffe1d9;
  }
  .tooltip-inner ul.comment-list {
    margin: 0;
    padding-top: 3px;
    padding-bottom: 5px;
    padding-right: 15px;
  }
  .dragobj {
    opacity: 0.33;
    background: #555 !important;
  }
  .dragtarget {
    position: relative;
    background: #ddf !important;
  }
  .dragpos-left:after, .dragpos-right:after {
    content: "";
    position:absolute;
    top: -5px;
    bottom: -5px;
    min-height: 10px;
    z-index: 100;
  }
  .dragpos-left:after {
    left: -2px;
    border-left: 3px solid #0f0;
  }
  .dragpos-right:after {
    right: -2px;
    border-right: 3px solid #0f0;
  }
  .dragitem {
    position: fixed;
    transform: translateY(500px);
    background: #fff;
    border: 1px solid #000;
    border-radius: 4px;
    padding: 0px 5px;
    font-size: 0.6rem;
  }
  .dragitem * {
    margin: 0px !important;
    padding: 0px !important;
  }
</style>
