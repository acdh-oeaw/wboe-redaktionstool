<template>
  <div class="start" v-if="!content && object">
    <ErrorCard :error="object.orgXmlObj.errors" title="Kritischer Fehler in XML-Datei!" variant="danger" @goto="goToObject"/>
    <ErrorCard :error="object.parserObj.errors" title="Kritischer Fehler in Parser-Datei!" variant="danger" @goto="goToObject"/>
    <ErrorCard :error="object.getCompressedBaseError()" title="Fehler" variant="danger" @goto="goToObject"/>
    <ErrorCard :error="object.warnings" title="Warnung" variant="warning" :closed="!Options.show.warnings" @goto="goToObject"/>
    <div v-if="object.contentObj">
      <div v-if="(object.errors && length(object.errors) > 0) || (object.orgXmlObj.errors && length(object.orgXmlObj.errors) > 0) || (object.parserObj.errors && length(object.parserObj.errors) > 0)">Bearbeiten nicht möglich!</div>
      <ViewEditorContent :content="object.contentObj" :view="this" @setTipLine="setTipLine" v-else/>
    </div>
    <div v-else>
      Keine Content-Daten vorhanden
    </div>
  </div>

  <div class="error" v-else>
    Kein "object" übergeben !!!!
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import ErrorCard from './general/ErrorCard'
  import ViewEditorContent from './ViewEditor/ViewEditorContent'

  import _ from 'lodash'

  export default {
    name: 'ViewEditor',
    props: {
      object: Object,
      content: Object,
      view: Object
    },
    data () {
      return {
        'isOpen': true,
        'errorsOpen': true,
        'warningsOpen': true,
      }
    },
    mounted () {
      // console.log({x: this.$el})
      this.$nextTick(() => {
        this.$el.parentElement.scrollTop = this.$el.parentElement.scrollTop + 1
      })
    },
    computed: {
      ...mapState(['Options']),
    },
    methods: {
      length (val) {
        if (Array.isArray(val)) {
          return val.length
        } else {
          return Object.keys(val).length
        }
      },
      goToObject (aObj) {
        let aElement = document.getElementById('eo' + aObj.uId)
        if (aElement) {
          // console.log(aElement)
          let opendPanels = false
          if (aElement.offsetParent === null) {
            let pElement = aElement.parentElement
            while (pElement) {
              if (pElement.classList.contains('fxcollapse')) {
                if (pElement.__vue__ && pElement.__vue__.$parent) {
                  if (pElement.__vue__.$parent.hasOwnProperty('isOpen') && pElement.__vue__.$parent.isOpen === false) {
                    pElement.__vue__.$parent.isOpen = true
                    opendPanels = true
                  } else if (pElement.__vue__.$parent.$parent.hasOwnProperty('isOpen') && pElement.__vue__.$parent.$parent.isOpen === false) {
                    pElement.__vue__.$parent.$parent.isOpen = true
                    opendPanels = true
                  }
                }
              }
              pElement = pElement.parentElement
            }
          }
          if (opendPanels) {
            this.scrollToObjectv(aElement)
          } else {
            this.$parent.$el.getElementsByClassName('vieweditorobject')[0].scrollTop = aElement.getBoundingClientRect().top - 300
          }
        }
      },
      scrollToObjectv: _.debounce(function (aElement) {
        this.$parent.$el.getElementsByClassName('vieweditorobject')[0].scrollTop = aElement.getBoundingClientRect().top - 300
      }, 250),
      setTipLine (aTipLine) {
        this.$emit('setTipLine', aTipLine)
      },
    },
    components: {
      ErrorCard,
      ViewEditorContent,
    },
  }
</script>

<style scoped>
  .inline {
    display: inline;
    cursor: default;
  }
  .val-fix {
    padding-bottom: 3px;
    border-radius: 2px;
  }
  .val-fix:hover {
    background: #eee;
  }
  .enumeraterom {
    font-weight: bold;
  }
</style>
