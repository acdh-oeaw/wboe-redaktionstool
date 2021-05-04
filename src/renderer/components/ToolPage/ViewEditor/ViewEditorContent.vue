<template>
  <EditorObjFrame @setTipLine="setTipLine" :content="content" :view="view" v-if="content">
    <template  v-if="showAttributeBefore">
      <InlineAttributes :content="content" :attrOpt="attrOpt" :attrKey="attrKey" :key="content.uId + '-attr-' + attrKey" v-for="(attrOpt, attrKey) in showAttributeBefore"/>
    </template>

    <span :style="'line-height' + Options.options.lineHeight + ';'"
          :class="
              'val-fix' +
              (layout.bold ? ' bold' : '') +
              (layout.italic ? ' italic' : '') +
              (layout.underline ? ' underline' : '') +
              (layout.ls1pt ? ' ls1pt' : '')
          " v-if="valueType === 'fix'">
      {{ content.orgXmlObj.getValueByOption(this.content.parserObj.options.getOption('value'), false) }}
    </span>
    <template v-else-if="fxFunction">
      <GeoSelect     :content="content" v-if="fxFunction.name === 'GeoSelect'"/>
      <RefBiblSelect :content="content" v-else-if="fxFunction.name === 'RefBiblSelect'"/>
      <XRlvModal     :content="content" v-else-if="fxFunction.name === 'XRlvModal'"/>
    </template>
    <EditableValue :content="content" v-else-if="valueType === 'editable'"/>

    <template slot="childs" v-if="content.childs.length > 0 && !(fxFunction)">
      <ViewEditorContent ref="childs" :view="view" :content="aContent" @setTipLine="setTipLine"
        v-for="(aContent) in contentChildsShown"
        :key="'vec' + aContent.uId"
      />
    </template>

    <template slot="after" v-if="showAttributeAfter">
      <InlineAttributes :content="content" :attrOpt="attrOpt" :attrKey="attrKey" :key="content.uId + '-attr-' + attrKey" v-for="(attrOpt, attrKey) in showAttributeAfter"/>
    </template>
  </EditorObjFrame>

  <div class="error" v-else>
    Kein "object" übergeben !!!!
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import EditorObjFrame from './EditorObjFrame'
  import EditableValue from './EditableValue'
  import InlineAttributes from './InlineAttributes'
  // fxFunctions
  import GeoSelect from './fxFunctions/GeoSelect'
  import RefBiblSelect from './fxFunctions/RefBiblSelect'
  import XRlvModal from './fxFunctions/XRlvModal'

  export default {
    name: 'ViewEditorContent',
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
    },
    computed: {
      ...mapState(['Options']),
      layout () {
        return (this.content.parserObj && this.content.parserObj.options && this.content.parserObj.options.getOption('layout')) || {}
      },
      fxFunction () {
        return (this.content.parserObj && this.content.parserObj.options && this.content.parserObj.options.getOption('editor.fxFunction'))
      },
      valueType () {		// Ist der aktuelle Wert 'fix', 'editable' oder 'none'?
        return (this.content.parserObj.options && this.content.parserObj.options.getOption('value'))
               ? (!this.content.parserObj.options.getOption('value.edit.use'))
               ? 'fix' : 'editable' : 'none'
      },
      contentChildsShown () {
        return this.content.childs.filter((aObj) => (aObj && aObj.orgXmlObj
        && (aObj.parserObj && aObj.parserObj.ready && aObj.parserObj.useable)
        && (aObj.orgXmlObj.type === 'TEXT' || aObj.orgXmlObj.type === 'ELEMENT')
        && !(aObj.parserObj.options && aObj.parserObj.options.getOption('layout.hidden'))))
      },
      showAttributeBefore () {
        return this.content.parserObj.options && this.content.parserObj.options.getOption('layout.showAttributeBefore')
      },
      showAttributeAfter () {
        return this.content.parserObj.options && this.content.parserObj.options.getOption('layout.showAttributeAfter')
      }
    },
    methods: {
      setTipLine (aTipLine) {
        this.$emit('setTipLine', aTipLine)
      },
    },
    components: {
      EditorObjFrame,
      EditableValue,
      InlineAttributes,
      GeoSelect,
      RefBiblSelect,
      XRlvModal,
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
