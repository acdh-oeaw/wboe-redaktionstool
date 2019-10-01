<template>
  <div class="start" v-if="!content && object">
    <ErrorCard :error="object.errors" title="Fehler" variant="danger"/>
    <ErrorCard :error="object.warnings" title="Warnung" variant="warning"/>
    <div v-if="object.content">
      <ViewXmlObject :content="aContent" :key="aKey" v-for="(aContent, aKey) in object.content"/>
    </div>
    <div v-else>
      Keine Content-Daten vorhanden
    </div>
  </div>

  <div class="obj" v-else-if="content">
    <b-card :header="content.name" no-body :class="{'mib10': true, 'paneldecent': true, 'invert': headerVariante !== 'Default'}" :border-variant="headerVariante" :header-bg-variant="headerVariante">
      <div slot="header">
        <button v-b-toggle="'collapse-' + _uid" class="header-btn-toggle" :style="'color: ' + pHeaderColor + ';'">
          <font-awesome-icon icon="question-circle" class="fa-icon icmd" v-if="content.type === 'UNKNOWN'"/>
          <font-awesome-icon icon="font" class="fa-icon icmd" v-if="content.type === 'TEXT'"/>
          <font-awesome-icon icon="comment" class="fa-icon icmd" v-if="content.type === 'COMMENT'"/>
          <font-awesome-icon icon="project-diagram" class="fa-icon icmd" v-if="content.type === 'PROCESSING_INSTRUCTION'"/>
          <span><b>{{ content.name }}</b></span>
          <span class="val" v-if="content.value"> = <i>{{ tranculatedValue }}</i></span>
          <span class="attribut" v-for="(attrOpt, attr) in content.attributes">
            {{ attr + ((attrOpt) ? ':' : '') }}&nbsp;
            <span v-if="attrOpt">{{ attrOpt }}</span>
          </span>
          <font-awesome-icon :icon="((isOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/>
          <font-awesome-icon icon="exclamation-triangle" class="float-right fa-icon mir5" style="color: #d33;" v-if="length(content.errors) > 0"/>
        </button>
      </div>
      <b-collapse v-model="isOpen" :id="'collapse-' + _uid">
        <b-card-body>
          <div v-if="length(content.errors)">
            <b>Fehler:</b><br>
            {{ content.errors }}
          </div>
          <b-button-toolbar aria-label="Toolbar with button groups and dropdown menu">
            <b-button-group size="sm" class="mr-1">
              <b-button @click="setInfoOpen(null)"><font-awesome-icon :icon="((infoOpen) ? 'eye' : 'eye-slash')" class="fa-icon"/></b-button>
              <b-button @click="setInfoOpen('value')" v-if="content.value" :pressed="infoOpen === 'value'" variant="outline-secondary"><b>Value</b></b-button>
              <b-button @click="setInfoOpen('comment')" v-if="content.comments.length > 0" :pressed="infoOpen === 'comment'" variant="outline-secondary"><b>Comments</b></b-button>
            </b-button-group>
            <b-input-group size="sm" class="mx-1" v-if="content.childs.length > 0">
              <b-input-group-prepend is-text><b>Kinder:</b>&nbsp;({{ content.childs.length }})</b-input-group-prepend>
              <b-button @click="showChilds(true)" class="form-control" variant="outline-secondary"><font-awesome-icon icon="eye" class="fa-icon"/></b-button>
              <b-button @click="showChilds(false)" class="form-control" variant="outline-secondary"><font-awesome-icon icon="eye-slash" class="fa-icon"/></b-button>
            </b-input-group>
          </b-button-toolbar>
          <div>
            <code class="lb val" v-if="infoOpen === 'value'">{{ content.value }}</code>
            <code class="lb" v-if="infoOpen === 'comment'"><ul><li v-for="comment in content.comments">{{ comment }}</li></ul></code>
          </div>
          <div v-if="content.childs.length > 0">
            <b>Kinder:</b><br>
            <ViewXmlObject ref="childs" :content="aContent" :key="aKey" v-for="(aContent, aKey) in content.childs"
              v-if="!(aContent.type === 'UNKNOWN' || aContent.type === 'COMMENT' || aContent.type === 'PROCESSING_INSTRUCTION') || Options.show.xmlObjectUselessTypes"
            />
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>

  <div class="error" v-else>
    Kein "object" übergeben !!!!
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import ErrorContent from './general/ErrorContent'
  import ErrorCard from './general/ErrorCard'

  export default {
    name: 'ViewXmlObject',
    props: {
      object: Object,
      content: Object,
    },
    data () {
      return {
        'isOpen': false,
        'errorsOpen': true,
        'processOpen': false,
        'valueOpen': false,
        'xmlOpen': false,
        'infoOpen': null,
        'pHeaderColor': '#333',
      }
    },
    computed: {
      ...mapState(['Options']),
      headerVariante () {
        if (this.content.errors.length > 0) {
          this.pHeaderColor = '#eee'
          return 'danger'
        }
        if (this.content.type === 'UNKNOWN' || this.content.type === 'COMMENT' || this.content.type === 'PROCESSING_INSTRUCTION') {
          this.pHeaderColor = '#eee'
          return 'secondary'
        }
        if (this.content.type === 'TEXT') {
          this.pHeaderColor = '#eee'
          return 'primary'
        }
        this.pHeaderColor = '#333'
        return 'Default'
      },
      tranculatedValue () {
        var aVal = this.content.value
        if (aVal) {
          return aVal.length > 25 ? aVal.slice(0, 25) + '...' : aVal
        } else {
          return ''
        }
      },
    },
    methods: {
      showChilds (state) {
        this.$refs.childs.forEach(function (c) {
          c.setIsOpen(state)
        })
      },
      setIsOpen (state) {
        this.isOpen = state
      },
      setInfoOpen (open) {
        this.infoOpen = ((this.infoOpen !== open) ? open : null)
      },
      length (val) {
        if (Array.isArray(val)) {
          return val.length
        } else {
          return Object.keys(val).length
        }
      },
    },
    created () {
      if (this.content) {
        if (!this.content.parserIgnore
        && this.content.type !== 'TEXT') {
          this.isOpen = true
        }
      }
    },
    components: {
      ErrorContent,
      ErrorCard
    },
  }
</script>

<style scoped>
  span.tree+span.tree:before {
    content: " > "
  }
  code.lb {
    white-space: pre;
  }
  code.val {
    color: #007bff;
  }
  .card-header .val > i {
    color: #007bff;
  }
  .invert > .card-header .val > i {
    color: #ccf;
  }
  .icmd {
    font-size: 16px !important;
  }
  .obj > .obj {
    margin-left: 23px;
  }
  .item {
    border: 1px solid #ddd;
    margin-top: -1px;
    padding: 1px 6px;
    border-radius: 20px;
  }
  .item.danger {
    background: #fee;
  }
  .item > .title {
    margin-left: 5px;
    padding: 4px 12px;
    font-weight: bold;
  }
  .item > button {
    margin: 0px;
    padding: 0px;
    background: none;
    border: none;
    width: 17px;
  }
  .item > .icon ~ .icon {
    margin-left: 5px;
  }
  .item > .error {
    float: right;
    margin-left: 15px;
  }
  .item > .attributes {
    font-size: 11px;
    color: #eee;
    float: right;
    margin-top: 3px;
    margin-right: -3px;
  }
  .item > .attributes > .attr {
    background: #888;
    padding: 2px 6px;
    border-radius: 8px;
    margin-left: 1px;
  }
  .item > .attributes > .attr > i {
    font-style: normal;
    color: #666;
    background: #eee;
    margin-left: 5px;
    padding: 1px 6px 1px 4px;
    border-radius: 0px 10px 10px 0px;
    margin-right: -5px;
  }
  .item > .value {
  }
  .item > .value:before {
    content: "> ";
  }
  .add-item {
    background: #eef;
  }
  .add-item > button {
    width: 100%;
    text-align: left;
  }
  .item > button:not([disabled]), .add-item > button:not([disabled]) {
    cursor: pointer;
  }
  .item.comment-item {
    font-size: 12px;
    background: #eee;
  }
  .attribut {
    display: inline-block;
    color: #eee;
    background: #444;
    margin-left: 5px;
    font-size: 12px;
    line-height: 1.2;
    padding: 3px 6px 2px 8px;
    border-radius: 10px;
  }
  .attribut > span {
    background: #eee;
    color: #444;
    padding: 1px 5px;
    margin-right: 3px;
  }
  div.g-errors {
    max-height: calc( 70vh - 200px );
    overflow: auto;
    padding: 8px 10px;
    margin: -8px;
  }
</style>
