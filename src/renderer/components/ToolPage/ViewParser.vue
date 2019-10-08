<template>
  <div class="start" v-if="parser && !content">
    <ErrorCard :error="parser.errors" title="Fehler" variant="danger"/>
    <ErrorCard :error="parser.warnings" title="Warnung" variant="warning"/>

    <b-card header="Info" no-body class="mib20 paneldecent" border-variant="primary" header-bg-variant="primary">
      <div slot="header"><button v-b-toggle="'collapse-info'" class="header-btn-toggle" style="color: #fff;"><b>Info</b><font-awesome-icon :icon="((topInfoOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/></button></div>
      <b-collapse v-model="topInfoOpen" id="collapse-info">
        <b-card-body>
          <b>orgFilename:</b> {{ parser.orgFilename }}<br>
          <b>orgPath:</b> {{ parser.orgPath }}<br>
          <template v-if="Object.keys(parser.additionalFiles).length > 0">
            <b>additionalFiles:</b> {{ Object.keys(parser.additionalFiles).join(', ') }}<br>
          </template>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card header="Header" no-body class="mib20 paneldecent" border-variant="primary" header-bg-variant="primary">
      <div slot="header"><button v-b-toggle="'collapse-header'" class="header-btn-toggle" style="color: #fff;"><b>Header</b><font-awesome-icon :icon="((headerOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/></button></div>
      <b-collapse v-model="headerOpen" id="collapse-header">
        <b-card-body>
          <div v-if="parser.header">
            <ul class="mi0 pl20">
              <li v-for="(line, aKey) in parser.header.split('\n')" :key="'phl' + aKey">{{ line }}</li>
            </ul>
          </div>
          <div v-else>
            Keine Header-Daten vorhanden
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card header="Content" no-body class="mib20 paneldecent" border-variant="primary" header-bg-variant="primary">
      <div slot="header"><button v-b-toggle="'collapse-content'" class="header-btn-toggle" style="color: #fff;"><b>Content</b><font-awesome-icon :icon="((contentOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/></button></div>
      <b-collapse v-model="contentOpen" id="collapse-content">
        <b-card-body>
          <div v-if="parser.content">
            <ViewParser2 :parser="parser" :content="aContent" :key="aKey" v-for="(aContent, aKey) in parser.content"/>
          </div>
          <div v-else>
            Keine Content-Daten vorhanden
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card header="System" no-body class="mib20 paneldecent" border-variant="primary" header-bg-variant="primary">
      <div slot="header"><button v-b-toggle="'collapse-system'" class="header-btn-toggle" style="color: #fff;"><b>System</b><font-awesome-icon :icon="((systemOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/></button></div>
      <b-collapse v-model="systemOpen" id="collapse-system">
        <b-card-body>
          <div v-if="parser.system">
            <ViewParser2 :parser="parser" :content="aContent" :key="aKey" v-for="(aContent, aKey) in parser.system"/>
          </div>
          <div v-else>
            Keine System-Daten vorhanden
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>

  </div>

  <div class="obj" v-else-if="content">
    <b-card :header="content.name" no-body :class="{'mib10': true, 'paneldecent': true, 'invert': headerVariante !== 'Default'}" :border-variant="headerVariante" :header-bg-variant="headerVariante">
      <div slot="header">
        <button v-b-toggle="'collapse-' + _uid" class="header-btn-toggle fx-btn" :style="'color: ' + pHeaderColor + ';'">
          <!-- <font-awesome-icon icon="id-badge" class="fa-icon icmd" v-if="getValOfSubProp(content, 'p.options.id')"/> -->
          <font-awesome-icon icon="clone" class="fa-icon icmd" v-if="content.isCopy"/>
          <!-- <font-awesome-icon icon="sitemap" class="fa-icon icmd" v-if="Array.isArray(getValOfSubProp(content, 'p.for'))"/> -->
          <font-awesome-icon icon="bars" class="fa-icon icmd" v-if="content.options.get('tag.multiple.use')"/>
          <font-awesome-icon icon="arrows-alt-v" class="fa-icon icmd" v-if="content.options.get('tag.anywhere.use')"/>
          <font-awesome-icon icon="question-circle" class="fa-icon icmd" v-if="content.options.get('tag.possibleTag.use')"/>
          <span v-if="content.options.get('title.use')"><b>{{ content.options.get('title.value') }}</b> ({{ content.name }})&nbsp;</span>
          <span v-else><b>{{ content.name }}</b>&nbsp;</span>
          <span class="val" v-if="content.options.get('value.is.use')"> = <i>{{ tranculatedValue }}</i></span>
          <span> (uId: {{ content.uId }}<span v-if="content.options && content.options.get('id')">, id: <b>{{ content.options.get('id') }}</b></span>)</span>
          <font-awesome-icon icon="bars" class="fa-icon" v-if="Array.isArray(content.options.get('value.possibleValues'))"/>
          <font-awesome-icon :icon="((content.options.get('value.edit.use')) ? 'edit' : ((content.options.get('value.variable.use')) ? 'lock-open' : 'lock'))" class="fa-icon icmd"/>
          <span class="attribut" v-for="(attrOpt, attr) in content.options.get('attributes')" :key="'attr' + attr">
            {{ attr + ((attrOpt.value) ? ':' : '') }}&nbsp;
            <span v-if="attrOpt.value">{{ attrOpt.value }}</span>
            <font-awesome-icon icon="bars" class="fa-icon" v-if="Array.isArray(content.options.get('attributes.' + attr + '.possibleValues'))"/>
            <font-awesome-icon :icon="((attrOpt.type === 'fixed' || !attrOpt.type) ? 'lock' : ((attrOpt.type === 'variable') ? 'lock-open' : 'question-circle'))" class="fa-icon"/>
          </span>
          <font-awesome-icon :icon="((isOpen) ? 'eye' : 'eye-slash')" class="float-right fa-icon"/>
          <font-awesome-icon icon="exclamation-triangle" class="float-right fa-icon mir5" style="color: #d33;" v-if="content.errors.length > 0"/>
        </button>
      </div>
      <b-collapse v-model="isOpen" :id="'collapse-' + _uid">
        <b-card-body>
          <b-alert show variant="danger" v-if="content.errors.length > 0">
            <b>Fehler:</b><br>
            {{ content.errors }}
          </b-alert>
          <b-button-toolbar aria-label="Toolbar with button groups and dropdown menu">
            <b-button-group size="sm" class="mr-1">
              <b-button @click="setInfoOpen(null)"><font-awesome-icon :icon="((infoOpen) ? 'eye' : 'eye-slash')" class="fa-icon"/></b-button>
              <b-button @click="setInfoOpen('value')" v-if="content.options.get('value.is.use')" :pressed="infoOpen === 'value'" variant="outline-secondary"><b>Value</b></b-button>
              <b-button @click="setInfoOpen('options')" :pressed="infoOpen === 'options'" variant="outline-secondary"><b>Optionen</b></b-button>
            </b-button-group>
            <b-input-group size="sm" class="mx-1" v-if="content.childs.length > 0">
              <b-input-group-prepend is-text><b>Kinder:</b>&nbsp;({{ content.childs.length }})</b-input-group-prepend>
              <b-button @click="showChilds(true)" class="form-control" variant="outline-secondary"><font-awesome-icon icon="eye" class="fa-icon"/></b-button>
              <b-button @click="showChilds(false)" class="form-control" variant="outline-secondary"><font-awesome-icon icon="eye-slash" class="fa-icon"/></b-button>
            </b-input-group>
          </b-button-toolbar>
          <div>
            <code class="lb val" v-if="infoOpen === 'value'">{{ getValOfSubProp(content, 'p.options.value.is.value') }}</code>
            <code class="lb" v-if="infoOpen === 'options'">{{ content.options.options }}</code>
          </div>
          <div v-if="content.childs.length > 0">
            <b>Kinder:</b><br>
            <template v-if="!content.isCopy || isOpen">
              <ViewParser2 ref="childs" :parser="parser" :content="aContent"
                v-for="(aContent, aKey) in content.childs"
                :key="aKey"
              />
            </template>
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>

  <div class="error" v-else>
    Weder "parser" noch "content" !!!!
  </div>
</template>

<script>
  import ErrorContent from './general/ErrorContent'
  import ErrorCard from './general/ErrorCard'

  export default {
    name: 'ViewParser2',
    props: {
      parser: Object,
      content: Object,
    },
    data () {
      return {
        'isOpen': false,
        'errorsOpen': true,
        'topInfoOpen': true,
        'headerOpen': true,
        'contentOpen': true,
        'systemOpen': false,
        'infoOpen': null,
        'pHeaderColor': '#333',
      }
    },
    computed: {
      headerVariante () {
        if (this.content.errors.length > 0) {
          this.pHeaderColor = '#eee'
          return 'danger'
        }
        if (this.content.name === '#unknown') {
          this.pHeaderColor = '#eee'
          return 'secondary'
        }
        this.pHeaderColor = '#333'
        return 'Default'
      },
      tranculatedValue () {
        var aVal = this.content.options.get('value.is.value')
        if (aVal) {
          return aVal.length > 25 ? aVal.slice(0, 25) + '...' : aVal
        } else {
          return ''
        }
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
      this.isOpen = !(this.content && this.content.isCopy)
    },
    components: {
      ErrorContent,
      ErrorCard
    }
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
  div.g-errors {
    max-height: calc( 70vh - 200px );
    overflow: auto;
    padding: 8px 10px;
    margin: -8px;
  }
  .fx-btn .fa-icon {
    margin-left: 3px;
    margin-right: 3px;
  }
  .fx-btn .fa-icon:first-child {
    margin-left: 0px;
  }
  .fx-btn .fa-icon:last-child {
    margin-right: 0px;
  }
  /* .fx-btn .fa-icon.float-right {
  } */
</style>
