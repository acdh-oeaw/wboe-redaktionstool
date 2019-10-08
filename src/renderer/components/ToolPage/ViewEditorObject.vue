<template>
  <div class="start" v-if="!content && object">
    <ErrorCard :error="object.getCompressedBaseError()" title="Fehler" variant="danger"/>
    <ErrorCard :error="object.warnings" title="Warnung" variant="warning"/>
    <div v-if="object.contentObj">
      <ViewEditorObject :content="object.contentObj"/>
    </div>
    <div v-else>
      Keine Content-Daten vorhanden
    </div>
  </div>

  <div class="obj" v-else-if="content">
    <b-card :header="objName" no-body :class="{'mib10': true, 'paneldecent': true, 'invert': headerVariante !== 'Default'}" :border-variant="headerVariante" :header-bg-variant="headerVariante">
      <div slot="header">
        <button v-b-toggle="'collapse-' + _uid" class="header-btn-toggle" :style="'color: ' + pHeaderColor + ';'">
          <font-awesome-icon icon="question-circle" class="fa-icon icmd" v-if="content.type === 'UNKNOWN'"/>
          <span><b>{{ objName }}</b>&nbsp;</span>
          <span class="val" v-if="aValue"> = <i>{{ tranculatedValue }}</i>&nbsp;</span>
          <span class="attribut" v-for="(attrOpt, attr) in content.orgXmlObj.attributes" :key="'a' + attr">
            {{ attr + ((attrOpt) ? ':' : '') }}&nbsp;
            <span v-if="attrOpt">{{ attrOpt }}</span>
          </span>
          <span>&nbsp;count: {{ content.count }}, countParser: {{  content.countParser }}<b v-if="content.isMultiple">, multipleNr: {{ content.multipleNr }}, multipleLast: {{ content.multipleLast }}</b><b v-if="content.isParserCopy">, parserCopyDeep: {{ content.parserCopyDeep }}</b></span>
          <font-awesome-icon :icon="((isOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/>
          <font-awesome-icon icon="exclamation-triangle" class="float-right fa-icon mir5" style="color: #d33;" v-if="length(content.errors) > 0"/>
        </button>
      </div>
      <b-collapse v-model="isOpen" :id="'collapse-' + _uid">
        <b-card-body>
          <b-alert show variant="danger" v-if="length(content.errors)">
            <b class="alert-heading">Fehler:</b><br>
            <ErrorContent :error="content.errors"/>
          </b-alert>
          <b-alert show variant="warning" v-if="length(content.warnings)">
            <b class="alert-heading">Warnung:</b><br>
            <ErrorContent :error="content.warnings"/>
          </b-alert>
          <b-button-toolbar aria-label="Toolbar with button groups and dropdown menu">
            <b-button-group size="sm" class="mr-1">
              <b-button @click="setInfoOpen(null)"><font-awesome-icon :icon="((infoOpen) ? 'eye' : 'eye-slash')" class="fa-icon"/></b-button>
              <b-button @click="setInfoOpen('value')" v-if="aValue" :pressed="infoOpen === 'value'" variant="outline-secondary"><b>Value</b></b-button>
              <b-button @click="setInfoOpen('matches')" v-if="content.parserMatches.length > 0" :pressed="infoOpen === 'matches'" variant="outline-secondary"><b>Matches</b></b-button>
              <b-button @click="setInfoOpen('addableAfter')" v-if="content.addableAfter.length > 0" :pressed="infoOpen === 'addableAfter'" variant="outline-secondary"><b>addableAfter</b></b-button>
              <!-- <b-button @click="setInfoOpen('comment')" v-if="content.comments.length > 0" :pressed="infoOpen === 'comment'" variant="outline-secondary"><b>Comments</b></b-button> -->
            </b-button-group>
            <b-input-group size="sm" class="mx-1" v-if="content.childs.length > 0">
              <b-input-group-prepend is-text><b>Kinder:</b>&nbsp;({{ content.childs.length }})</b-input-group-prepend>
              <b-button @click="showChilds(true)" class="form-control" variant="outline-secondary"><font-awesome-icon icon="eye" class="fa-icon"/></b-button>
              <b-button @click="showChilds(false)" class="form-control" variant="outline-secondary"><font-awesome-icon icon="eye-slash" class="fa-icon"/></b-button>
            </b-input-group>
          </b-button-toolbar>
          <div>
            <code class="lb val" v-if="infoOpen === 'value'">{{ aValue }}</code>
            <code class="lb" v-if="infoOpen === 'matches'">{{ matches }}</code>
            <code class="lb" v-if="infoOpen === 'addableAfter'">{{ content.addableAfter }}</code>
            <!-- <code class="lb" v-if="infoOpen === 'comment'"><ul><li v-for="comment in content.comments">{{ comment }}</li></ul></code> -->
          </div>
          <div v-if="content.childs.length > 0">
            <b>Kinder:</b><br>
            <ViewEditorObject ref="childs" :content="aContent"
              v-for="(aContent, aKey) in contentChildsOk"
              :key="'veo' + aKey + '-' + aContent.uId"
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
    name: 'ViewEditorObject',
    props: {
      object: Object,
      content: Object,
    },
    data () {
      return {
        'isOpen': false,
        'errorsOpen': true,
        'warningsOpen': true,
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
        if ((this.content.descendantsWithErrors && !this.isOpen)
        || (this.content.childsWithErrors)) {
          this.pHeaderColor = '#eee'
          return 'warning'
        }
        if (!this.content.parserObj) {
          this.pHeaderColor = '#eee'
          return 'secondary'
        }
        this.pHeaderColor = '#333'
        return 'Default'
      },
      aValue () {
        if (this.content) {
          if (this.content.orgXmlObj) {
            if (this.content.ignoreChilds) {
              return this.content.orgXmlObj.getValue(false)
            }
            if (['TEXT', 'COMMENT'].indexOf(this.content.orgXmlObj.type) > -1) {
              return this.content.orgXmlObj.value
            }
          }
        }
        return null
      },
      tranculatedValue () {
        if (this.aValue) {
          return this.aValue.length > 25 ? this.aValue.slice(0, 25) + '...' : this.aValue
        } else {
          return ''
        }
      },
      matches () {
        let aM = []
        if (this.content) {
          if (this.content.parserMatches.length > 0) {
            this.content.parserMatches.forEach(function (pM) {
              aM.push({'tag': pM.pObj.name, 'uId': pM.pObj.uId, ...pM.match})
            }, this)
          }
        }
        return aM
      },
      objName () {
        if (this.content) {
          if (this.content.parserObj) {
            return this.content.parserObj.name
          }
          if (this.content.orgXmlObj) {
            return this.content.orgXmlObj.name
          }
        }
        return '???'
      },
      contentChildsOk () {
        let aOut = []
        this.content.childs.forEach((aObj) => {
          if (!(aObj.errors.length === 0 && !aObj.parserObj) || this.Options.show.editorObjectWithoutParser) {
            aOut.push(aObj)
          }
        })
        return aOut
      }
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
        if (this.content.parents.length === 0) {		// Oberstes Element immer offen!
          this.isOpen = true
        }
        if (this.content.useable && this.content.childs.length > 0		// Brauchbare Elemente mit Kindern aufklappen
        && this.content.parserMatches.length > 0) {		// Sofern ein Parser vergleich durchgeführt wurde.
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
  /* .item > .value {
  } */
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
</style>
