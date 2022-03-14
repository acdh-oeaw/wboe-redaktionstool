<template>
  <div class="test-page">
    <div class="container-fluid">
      <h2>Test ...</h2>
      <div v-if="testDateien.length > 0">
        <b-button-toolbar>
          <b-dropdown size="sm" class="mx-1" right variant="primary" :text="selTestDatei.name">
            <b-dropdown-item
              @click="selTestDatei = aFile"
              :active="selTestDatei === aFile"
              v-for="(aFile, aKey) in testDateien"
              :key="aKey"
            >
              {{ aFile.name }}
            </b-dropdown-item>
          </b-dropdown>
          <b-btn class="ml-2" @click="testPrev" :variant="selTestView === 'obj' ? 'primary' : null">Objekte laden</b-btn>
          <!-- <b-btn class="ml-2" @click="testEdit" :variant="selTestView === 'edit' ? 'primary' : null">Editor</b-btn> -->
          <b-form-checkbox v-model="sealed" class="ml-2">sealed</b-form-checkbox>
          <b-form-checkbox v-model="deepSealed" class="ml-2">deepSealed</b-form-checkbox>
          <b-btn class="ml-2" @click="selTestView = null; selShowTestPreview = false" :disabled="!selTestView">Reset</b-btn>
        </b-button-toolbar>
      </div>
      <div class="py-4" v-if="selTestView">
        Test: {{ selTestView }}
        <div v-if="timers.length > 0">
          <hr>
          Timer:
          <ul>
            <li v-for="(aTimer, aKey) in timers" :key="'t' + aKey">{{ aTimer.name }}: <b>{{ aTimer.duration.toLocaleString() }} ms</b> ({{ (aTimer.duration / aTimer.objCount).toLocaleString() }} ms pro Objekt, {{ aTimer.objCount.toLocaleString() }} Objekte)</li>
          </ul>
        </div>
        <hr>
        <b-btn class="ml-2" @click="selShowTestPreview = !selShowTestPreview" :variant="selShowTestPreview ? 'primary' : null">Vorschau zeigen</b-btn>
        <div class="pb-4" v-if="selShowTestPreview">
          <hr>
          <ViewPreview
            :start="true"
            :showAnchors="true"
            :showComments="false"
            :options="Options"
            :object="editorObject"
            v-if="editorObject && editorObject.contentObj"
          />
          <hr>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import XmlObject from '@/functions/xml/Xml'
  import EditorObject from '@/functions/editor/Editor'
  import ViewPreview from './ToolPage/ViewPreview/ViewPreview'
  import { mapState } from 'vuex'
  import { remote } from 'electron'
  import stdFunctions from '@/functions/stdFunctions'
  const path = require('path')
  const fs = remote.require('fs')
  const aPath = './test/'

  export default {
    name: 'test-page',
    data () {
      return {
        testDateien: [],
        xmlObject: null,
        editorObject: null,
        selTestDatei: null,
        selTestView: null,
        selShowTestPreview: false,
        sealed: true,
        deepSealed: false,
        timers: []
      }
    },
    mounted () {
      fs.readdir(aPath, (e, files) => {
        this.testDateien = []
        if (e) return console.error(e)
        console.log(files)
        files.forEach(f => {
          if (path.extname(f) === '.xml') {
            console.log(f)
            this.testDateien.push({
              name: f,
              xml: fs.readFileSync(aPath + f, 'utf8').replace(/\r/gmi, '')
            })
          }
        })
        this.selTestDatei = this.testDateien[0]
        console.log(this.testDateien)
      })
    },
    methods: {
      testPrev () {
        this.selTestView = 'obj'
        this.timers = []
        this.$nextTick(() => {
          // Erstelle xmlObject
          let tXml = performance.now()
          let xmlObject = new XmlObject.XmlBase(this.selTestDatei.xml)
          if (this.sealed || this.deepSealed) {
            xmlObject = Object.seal(xmlObject)
          }
          this.xmlObject = xmlObject
          this.timers.push({ name: 'xmlObject', duration: performance.now() - tXml, objCount: xmlObject.family.length })
          // Erstelle editorObject
          let tEditObj = performance.now()
          let editorObject = new EditorObject.EditorBase(this.Parser.parser, xmlObject, this.changeCall)
          if (this.sealed) {
            editorObject = Object.seal(editorObject)
          }
          if (this.deepSealed) {
            editorObject = stdFunctions.deepSeal(editorObject)
          }
          this.editorObject = editorObject
          this.timers.push({ name: 'editorObject', duration: performance.now() - tEditObj, objCount: editorObject.family.length })
          console.log('editorObject', this.editorObject)
          console.log('parser', this.Parser.parser)
        })
      },
      testEdit () {
        this.selTestView = 'edit'
        this.timers = []
      },
      changeCall () {
        console.log('ToolPage - changeCall')
      }
    },
    computed: {
      ...mapState(['Options']),
      ...mapState(['Parser'])
    },
    watch: {
      selTestDatei () {
        this.selTestView = null
        this.selShowTestPreview = false
      },
      selShowTestPreview () {
        console.log('selShowTestPreview', this.selShowTestPreview)
        let st = performance.now()
        this.$nextTick(() => {
          this.timers.push({ name: 'selShowTestPreview - ' + (this.selShowTestPreview ? 'On' : 'Off'), duration: performance.now() - st, objCount: this.editorObject.family.length })
          console.log('selShowTestPreview', this.selShowTestPreview, 't:', performance.now() - st, 'ms')
        })
      }
    },
    components: {
      ViewPreview
    }
  }
</script>

<style>
  .test-page {
    margin-top: 10px;
  }
</style>
