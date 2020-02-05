<template>
  <div :class="'editorcontextmenu' + (subContextMenuLeft ? ' left' : '')" :id="'ecm-' + _uid" v-show="show"
      :style="{ top: this.top + 'px', left: this.left + 'px' }" tabindex="-1"
      @contextmenu.capture.prevent>
    <EditorContextMenuContent :content="content" :subContextMenuLeft="subContextMenuLeft" @close="close"  @clickcomment="clickComment"/>
  </div>
</template>

<script>
  import _ from 'lodash'
  import SelectPossibleValues from './SelectPossibleValues'
  import EditorContextMenuContent from './EditorContextMenuContent'

  export default {
    name: 'EditorContextMenu',
    props: {
      content: Object,
    },
    data () {
      return {
        'top': null,
        'left': null,
        'subContextMenuLeft': false,
        'show': false,
        'ready': false,
      }
    },
    watch: {
    },
    methods: {
      close () {
        this.top = null
        this.left = null
        this.removeEventListeners()
        this.show = false
        this.ready = false
      },
      clickComment (aCon) {
        this.$emit('clickcomment', aCon)
      },
      open (e) {
        this.ready = false
        this.addEventListeners()
        this.show = true
        this.$nextTick(() => {
          const largestHeight = window.innerHeight - this.$el.offsetHeight - 25
          const largestWidth = window.innerWidth - this.$el.offsetWidth - 25
          this.top = (e.clientY > largestHeight) ? largestHeight : e.clientY
          this.left = (e.clientX > largestWidth) ? largestWidth : e.clientX
          this.subContextMenuLeft = (((window.innerWidth - this.$el.offsetWidth) / 2) < this.left)
          this.$el.focus()
          this.ready = true
        })
      },
      addEventListeners () {
        if (!this.show) {
          document.addEventListener('focus', this.focusChanged, true)
          document.addEventListener('blur', this.focusChanged, true)
        }
      },
      removeEventListeners () {
        if (this.show) {
          document.removeEventListener('focus', this.focusChanged, true)
          document.removeEventListener('blur', this.focusChanged, true)
        }
      },
      focusChanged: _.debounce(function (e) {
        // console.log(this._uid, this.show, this.ready, document.activeElement, document.activeElement.closest('#ecm-' + this._uid))
        if (this.show && this.ready) {
          if (!document.activeElement.closest('#ecm-' + this._uid)) {
            this.close()
          }
        }
      }, 50),
    },
    beforeDestroy () {
      this.removeEventListeners()
    },
    components: {
      SelectPossibleValues,
      EditorContextMenuContent
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
