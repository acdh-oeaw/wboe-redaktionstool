<template>
  <div>
    <div class="context-menu-title clearfix"><b class="mir5" v-if="title">{{ title }}</b><i :class="(title ? 'float-right' : '')">Tag: {{ content.orgXmlObj.name }}</i></div>
    <div class="tools">
      <b-button-group size="sm" class="btn-group-xs d-flex" v-if="moveableLeft || moveableRight || deleteAble">
        <b-button @click="moveObj('left')" variant="primary" class="w-100" :disabled="!moveableLeft"><font-awesome-icon icon="angle-left" class="fa-icon"/></b-button>
        <b-button @click="deleteObj()" variant="danger" class="w-100" :disabled="!deleteAble"><font-awesome-icon icon="trash-alt" class="fa-icon"/></b-button>
        <b-button @click="moveObj('right')" variant="primary" class="w-100" :disabled="!moveableRight"><font-awesome-icon icon="angle-right" class="fa-icon"/></b-button>
      </b-button-group>
    </div>
    <ul v-if="content.orgXmlObj.name !== '#text'">
      <li @click="clickComment(content)"><font-awesome-icon icon="comment" :class="'fa-icon right' + (!(content.orgXmlObj && content.orgXmlObj.comments.length > 0) ? ' text-muted' : '')"/>Kommentare</li>
    </ul>
    <template v-if="attributes">
      <div class="context-menu-subtitle"><b>Attribute:</b></div>
      <ul>
        <li v-for="(aVal, aKey) in attributes" @mouseover="subShow = aKey" :key="'a' + aKey" @mouseleave="subShow = null">
          <font-awesome-icon :icon="aVal.icon" class="fa-icon" v-if="aVal.icon"/>
          <font-awesome-icon :icon="((aVal.editable) ? 'edit' : 'lock')" class="fa-icon right"/>
          <span>{{ aKey + ((aVal.value) ? ' = ' + aVal.value : '') }}</span>
          <div class="subContext" ref="subContext" :style="'top:' + subContextMenuTopPx + 'px;'" v-if="aVal.editable && subShow === aKey">
            <div class="sel-attribut" v-if="aVal.editType === 'select'">
              <button @click="selectAttr(aKey, -1)" class="sel-obj" v-if="aVal.options.canBeEmpty && aVal.options.canBeEmpty.use">
                <font-awesome-icon icon="check" class="fa-icon" v-if="!aVal.value"/>
                Kein Wert!
              </button>
              <button @click="selectAttr(aKey, attrKey)" class="sel-obj" v-for="(attrVal, attrKey) in aVal.options.possibleValues" :key="'a' + aKey + 'b' + attrKey">
                <font-awesome-icon icon="check" class="fa-icon"
                  v-if="
                    (attrVal.value || attrVal) === aVal.value ||
                    content.parserObj.options.getOption('attributes.' + aKey + '.prefix') + (attrVal.value || attrVal) === aVal.value
                  "
                />
                {{ attrVal.title || attrVal }}
              </button>
            </div>
            <div class="txt-attribut" v-else>
              <font-awesome-icon @click="$refs.attrEdit[0].focus()" icon="edit" class="fa-icon right" :title="aVal.editType"/>
              <span class="attr-edit" ref="attrEdit" @input="valAttrUpdate" @focus="valAttrUpdate" @blur="valAttrUpdateValue(aKey, $event)" @keyup.enter="valAttrUpdateValue(aKey, $event)" @keydown.enter.prevent contenteditable>{{ aVal.value }}</span>
            </div>
          </div>
        </li>
      </ul>
    </template>

    <template v-if="content.addableInner.length > 0 || content.addableAfter.length > 0">
      <div class="context-menu-subtitle"><b>Einfügen:</b></div>
    </template>

    <template v-if="content.addableInner.length > 0">
      <ul>
        <li @mouseover="subShow = 'addInner'" @mouseleave="subShow = null">
          <font-awesome-icon icon="circle-notch" class="fa-icon"/>
          <span>Einfügen in Tag "{{ content.orgXmlObj.name }}"</span>
          <div class="subContext" ref="subContext" :style="'top:' + subContextMenuTopPx + 'px;'" v-if="subShow === 'addInner'">
            <ul>
              <li @click="addIn(aVal.uId); close()" v-for="(aVal, aKey) in contentAddableInnerCShow" :key="'caics' + aKey">
                <font-awesome-icon icon="plus" class="fa-icon"/>
                {{ aVal.title }}
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </template>

    <template v-if="content.addableAfter.length > 0">
      <ul>
        <li @mouseover="subShow = 'addAfter'" @mouseleave="subShow = null">
          <font-awesome-icon icon="angle-right" class="fa-icon"/>
          <span>Einfügen nach Tag "{{ content.orgXmlObj.name }}"</span>
          <div class="subContext" ref="subContext" :style="'top:' + subContextMenuTopPx + 'px;'" v-if="subShow === 'addAfter'">
            <ul>
              <li @click="addAfter(aVal.uId); close()" v-for="(aVal, aKey) in contentAddableAfterCShow" :key="'caacs' + aKey">
                <font-awesome-icon icon="plus" class="fa-icon"/>
                <span class="mwellips">{{ aVal.title }}</span>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </template>

    <EditorContextMenuContent :content="content.parents[0]" :subContextMenuLeft="subContextMenuLeft" @close="close" @clickcomment="clickComment" v-if="content.parents.length > 0 && content.parserObj.options && content.parents.length > 0 && content.parserObj.options.getOption('editor.parentInContext')"/>
  </div>
</template>

<script>
  import _ from 'lodash'
  import SelectPossibleValues from './SelectPossibleValues'
  import veFunctions from './functions'

  export default {
    name: 'EditorContextMenuContent',
    props: {
      content: Object,
      subContextMenuLeft: Boolean,
    },
    data () {
      return {
        'subShow': null,
        'subContextMenuTopPx': 0,
      }
    },
    computed: {
      attributes () {
        if (this.content.parserObj.options && this.content.parserObj.options.getOption('attributes')) {
          let oAttr = {}
          let aAttributes = this.content.parserObj.options.getOption('attributes')
          Object.keys(aAttributes).forEach(function (aAttr) {
            let aIcon
            let aVal = this.content.orgXmlObj.attributes[aAttr]
            if (aVal) {
              // ToDo: weitere Prüfung?!
              aIcon = 'check'
            } else if (!aAttributes[aAttr].canBeEmpty || !aAttributes[aAttr].canBeEmpty.use) {
              aIcon = 'exclamation-triangle'
            }
            if (!aAttributes[aAttr].remove || !aAttributes[aAttr].remove.use) {
              oAttr[aAttr] = {'value': aVal, 'options': aAttributes[aAttr], 'icon': aIcon, 'editable': (aAttributes[aAttr].type === 'edit'), 'editType': ((aAttributes[aAttr].possibleValues) ? 'select' : 'text')}
            }
          }, this)
          if (Object.keys(oAttr).length > 0) {
            return oAttr
          }
        }
        return null
      },
      title () {
        if (this.content.parserObj.options) {
          if (this.content.parserObj.options.getResult('title')) {
            return this.content.parserObj.options.getResult('title')
          } else if (this.content.parserObj.options.getOption('tagAsTitle') || this.layoutBase === 'panel') {
            return this.content.orgXmlObj.name
          }
        }
        return null
      },
      deleteAble () {
        return (this.content.parserObj.options && this.content.parserObj.options.getOption('tag.possibleTag'))
            || (this.content.isMultiple && !(this.content.multipleNr === 0 && this.content.multipleLast))
      },
      moveableLeft () {
        // ToDo: Komplexere Abfrage!
        return this.content.isMultiple && this.content.multipleNr > 0
      },
      moveableRight () {
        // ToDo: Komplexere Abfrage!
        return this.content.isMultiple && !this.content.multipleLast
      },
      contentAddableInnerCShow () {
        let aOut = []
        this.content.addableInner.forEach((aObj) => {
          if (aObj.cShow) {
            aOut.push(aObj)
          }
        })
        return aOut
      },
      contentAddableAfterCShow () {
        let aOut = []
        this.content.addableAfter.forEach((aObj) => {
          if (aObj.cShow) {
            aOut.push(aObj)
          }
        })
        return aOut
      }
    },
    watch: {
      subShow (nVal, oVal) {
        if (nVal) {
          this.subContextMenuTopPx = 0
          this.$nextTick(() => {
            let aSubContext = ((Array.isArray(this.$refs.subContext)) ? this.$refs.subContext : [this.$refs.subContext])
            if (aSubContext && aSubContext[0]) {
              let aOverBottom = aSubContext[0].getBoundingClientRect().bottom - window.innerHeight + 25
              if (aOverBottom > 0) {
                this.subContextMenuTopPx = -aOverBottom
              }
            }
          })
        }
      },
    },
    methods: {
      selectAttr (aAttr, key) {
        this.content.orgXmlObj.setAttribute(aAttr, this.content.parserObj.options.getOption('attributes.' + aAttr + '.possibleValues')[key], this.content.parserObj.options.getOption('attributes.' + aAttr + '.prefix'))
        this.content.checkParser()
      },
      valAttrUpdateValue (aAttr, e) {
        this.content.orgXmlObj.setAttribute(aAttr, e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, ''))
        this.content.checkParser()
      },
      valAttrUpdate: _.debounce(function (e) {
        var restoreCaretPosition = veFunctions.saveCaretPosition(e.target)
        e.target.innerText = e.target.innerText.replace(/(\r\n\t|\n|\r\t)/gm, '')
        restoreCaretPosition()
      }, 20),
      deleteObj () {		// Objekt löschen!
        this.$emit('close')
        this.content.delete()
      },
      moveObj (dir = 'right') {		// Objekt nach rechts/links bewegen!
        this.$emit('close')
        let aSib = this.content.getSiblings(((dir === 'right') ? 'next' : 'prev'), true)
        if (aSib.length > 0) {
          if (this.content.isMultiple) {
            if ((dir === 'right' && !this.content.multipleLast) || (dir !== 'right' && this.content.multipleNr > 0)) {
              this.content.move(aSib[0], (dir === 'right'))
            }
          } else {
            // ToDo ! (Multiple beachten und überspringen)
          }
        }
      },
      addAfter (aParUId) {
        this.content.addAfter(this.content.parserObj.root.family[aParUId])
      },
      addIn (aParUId) {
        this.content.add(0, this.content.parserObj.root.family[aParUId])
      },
      close () {
        this.$emit('close')
      },
      clickComment (aCon) {
        this.$emit('close')
        this.$emit('clickcomment', aCon)
      },
    },
    components: {
      SelectPossibleValues,
    },
  }
</script>

<style scoped>
  .editorcontextmenu {
    width: 250px;
    background: #eee;
    border: 1px solid #6ba1dc;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    display: block;
    margin: 0;
    padding: 0;
    position: fixed;
    z-index: 99999;
  }
  .editorcontextmenu ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 12px;
    font-weight: 600;
  }
  .editorcontextmenu ul li {
    position: relative;
    margin: 0;
    padding: 2px 25px;
    font-size: 14px;
    line-height: 1.4;
    cursor: pointer;
  }
  .editorcontextmenu ul li:hover {
    background: #18e;
    color: #eee;
  }
  .context-menu-title {
    padding: 2px 10px;
    background: #307ed2;
    color: #fff;
  }
  .context-menu-subtitle {
    background: #fff;
    padding: 1px 10px;
    font-size: 14px;
  }
  .editorcontextmenu ul li > span {
    display: block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mwellips {
    display: block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .editorcontextmenu ul li > .fa-icon {
    position: absolute;
    margin-top: 4px;
    left: 7px;
  }
  .editorcontextmenu ul li > .fa-icon.right {
    left: auto;
    right: 7px;
  }
  .editorcontextmenu ul li > .subContext {
    display: block;
    position: absolute;
    max-height: 60vh;
    overflow-y: auto;
    left: 100%;
    top: 0;
    color: #333;
    background: #eee;
    border: 1px solid #6ba1dc;
    min-width: 250px;
    min-height: 100%;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
  }
  .editorcontextmenu.left ul li > .subContext {
    left: auto;
    right: 100%;
  }

  button.sel-obj {
    position: relative;
    margin: 0;
    padding: 2px 25px;
    background: #eee;
    border: none;
    display: block;
    width: 100%;
    text-align: left;
  }
  button.sel-obj:hover {
    background: #18e;
    color: #eee;
  }
  button.sel-obj > .fa-icon {
    position: absolute;
    margin-top: 4px;
    left: 7px;
  }
  .txt-attribut {
    position: relative;
  }
  .txt-attribut .attr-edit {
    display: block;
    width: 100%;
    padding: 2px 25px
  }
  .txt-attribut .attr-edit:focus {
    background: #fff;
  }
  .txt-attribut > .fa-icon {
    position: absolute;
    margin-top: 4px;
    left: 7px;
  }
  .txt-attribut > .fa-icon.right {
    left: auto;
    right: 7px;
  }
</style>
