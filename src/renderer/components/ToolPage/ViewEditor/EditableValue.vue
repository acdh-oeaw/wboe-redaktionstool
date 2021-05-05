<template>

  <span
    :class="
      'val-obj' +
      (content.parserObj.options.getOption('layout.bold') ? ' bold' : '') +
      (content.parserObj.options.getOption('layout.italic') ? ' italic' : '') +
      (content.parserObj.options.getOption('layout.underline') ? ' underline' : '') +
      (content.parserObj.options.getOption('layout.ls1pt') ? ' ls1pt' : '')
    "
    v-if="editType === 'selectPossibleValues'"
  >
    <SelectPossibleValues @select="setSelected" :selected="getSelected()" :selectedText="this.content.orgXmlObj.getValue(false)" :values="content.parserObj.options.getOption('value.is.possibleValues')" v-if="!refreshSelect"/>
  </span>

  <span
    :class="
      'val-obj val-txt' +
      (content.parserObj.options.getOption('layout.bold') ? ' bold' : '') +
      (content.parserObj.options.getOption('layout.italic') ? ' italic' : '') +
      (content.parserObj.options.getOption('layout.underline') ? ' underline' : '') +
      (content.parserObj.options.getOption('layout.ls1pt') ? ' ls1pt' : '')
    "
    v-else
  >
    <span :style="'line-height' + Options.options.lineHeight + ';'" :class="'val-edit val-focus icon-edit-black' + (!aValue ? ' empty' : '')" v-rt-ipa="(ipaOpen) && !Options.show.hideIpaKeyboard" ref="valEdit" @input="valEditUpdate" @focus="valFocus" @blur="valBlur" @keyup.enter="valEditUpdateValue" @keydown.enter.prevent contenteditable>{{ aValue }}</span>
  </span>

</template>

<script>
  import _ from 'lodash'
  import SelectPossibleValues from './SelectPossibleValues'
  import veFunctions from './functions'

  import { mapState } from 'vuex'

  export default {
    name: 'EditableValue',
    props: {
      content: Object
    },
    data () {
      return {
        refreshSelect: false,
        focus: false,
        ipaOpen: false
      }
    },
    computed: {
      ...mapState(['Options']),
      aValue () {
        return this.content.orgXmlObj.getValueByOption(this.content.parserObj.options.getOption('value'), false)
      },
      editType () {		// Art der Wert bearbeitung
        if (this.content.parserObj.options.getOption('value.is.possibleValues')) {
          return 'selectPossibleValues'
        }
        return 'text'
      }
    },
    watch: {
      'refreshSelect' (nVal) {
        if (nVal) {
          this.$nextTick(() => {
            this.refreshSelect = false
          })
        }
      },
    },
    methods: {
      getSelected () {		// Gibt die aktuell ausgewählte Option zurück
        let sVal = this.content.orgXmlObj.getValue(false)
        let oKey = -1
        this.content.parserObj.options.getOption('value.is.possibleValues').some(function (aVal, aKey) {
          if ((aVal.value || aVal) === sVal) {
            oKey = aKey
            return true
          }
        }, this)
        return oKey
      },
      setSelected (val) {		// Auswahl ändern
        if (val >= 0) {
          let aVal = this.content.parserObj.options.getOption('value.is.possibleValues')[val]
          this.content.orgXmlObj.setValue(aVal.value || aVal)
          if (aVal.attribute && Object.keys(aVal.attribute).length > 0) {
            Object.keys(aVal.attribute).forEach(function (aKey) {
              this.content.orgXmlObj.setAttribute(aKey, aVal.attribute[aKey])
            }, this)
          }
          this.content.checkParser()
        } else {
          this.content.orgXmlObj.setValue(null)
          this.content.checkParser()
        }
      },
      valFocus (e) {
        this.focus = true
        this.ipaOpen = true
        this.valEditUpdate(e)
      },
      valBlur (e) {
        this.focus = false
        this.valEditUpdateValue(e)
      },
      valEditUpdate: _.debounce(function (e) {		// Bei Textfeldern HTML-Elemente und Zeilenumbrüche entfernen
        var restoreCaretPosition = veFunctions.saveCaretPosition(e.target)
        e.target.innerText = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '')
        restoreCaretPosition()
      }, 20),
      valEditUpdateValue (e) {		// Aktuelle Eingabe setzen
        let nVal = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '')
        if (nVal !== this.aValue) {
          this.content.orgXmlObj.setValue(nVal)
          this.content.checkParser()
          if (e.target === document.activeElement) {
            let lPos = this.getCaretPosition(e.target)
            this.$nextTick(() => {
              this.setCaret(e.target, lPos)
            })
          }
        }
      },
      getCaretPosition (el) {
        var caretPos = 0
        if (window.getSelection) {
          var sel = window.getSelection()
          if (sel.rangeCount) {
            var range = sel.getRangeAt(0)
            if (range.commonAncestorContainer.parentNode === el) {
              caretPos = range.endOffset
            }
          }
        }
        return caretPos
      },
      setCaret (el, caretPos) {
        var range = document.createRange()
        if (window.getSelection) {
          var sel = window.getSelection()
          range.setStart(el.childNodes[0], caretPos)
          range.collapse(true)
          sel.removeAllRanges()
          sel.addRange(range)
        }
      }
    },
    components: {
      SelectPossibleValues
    },
  }
</script>

<style scoped>
  .val-txt {
    padding: 0px 1px;
    padding-bottom: 3px;
    border-radius: 2px;
  }
  .val-txt:hover {
    background: #eef;
  }
  .val-edit {
    display: inline-block;
    min-width:15px;
    padding: 0px 2px;
    cursor: text;
  }
  .val-edit.icon-edit-black::after {
    margin-left: 0.3em;
    cursor: pointer;
  }
  .val-edit.empty {
    border-bottom: 2px solid #f83;
    margin-bottom: -2px;
    min-width: 25px;
  }
</style>
