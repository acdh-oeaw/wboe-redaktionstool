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
          <b-btn class="ml-2" @click="testPrev" :variant="selTestView === 'prev' ? 'primary' : null">Vorschau</b-btn>
          <!-- <b-btn class="ml-2" @click="testEdit" :variant="selTestView === 'edit' ? 'primary' : null">Editor</b-btn> -->
          <b-btn class="ml-2" @click="selTestView = null" :disabled="!selTestView">Reset</b-btn>
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
      </div>
    </div>
  </div>
</template>

<script>
  import XmlObject from '@/functions/xml/Xml'
  import EditorObject from '@/functions/editor/Editor'
  import { mapState } from 'vuex'
  import { remote } from 'electron'
  const path = require('path')
  const fs = remote.require('fs')
  const aPath = './test/'
  export default {
    name: 'test-page',
    data () {
      return {
        testDateien: [],
        selTestDatei: null,
        selTestView: null,
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
        this.selTestView = 'prev'
        this.timers = []
        this.$nextTick(() => {
          // Erstelle xmlObject
          let tXml = performance.now()
          let xmlObject = new XmlObject.XmlBase(this.selTestDatei.xml)
          this.timers.push({ name: 'xmlObject', duration: performance.now() - tXml, objCount: xmlObject.family.length })
          // Erstelle editorObject
          let tEditObj = performance.now()
          let editorObject = new EditorObject.EditorBase(this.Parser.parser, xmlObject, this.changeCall)
          this.timers.push({ name: 'editorObject', duration: performance.now() - tEditObj, objCount: editorObject.family.length })
          console.log('editorObject', editorObject)
          console.log('parser', this.Parser.parser)
        })
      },
      testEdit () {
        this.selTestView = 'edit'
        this.timers = []
      }
    },
    computed: {
      ...mapState(['Parser'])
    },
    watch: {
      selTestDatei () {
        this.selTestView = null
      }
    },
    components: {
    }
  }
</script>

<style>
  .test-page {
    margin-top: 10px;
  }
</style>
