<template>
  <div class="tool-page">
    <div class="container-fluid">
      <!-- Obere Toolbar -->
      <b-button-toolbar class="main-toolbar">
        <b-btn @click="toggleCheckAllFiles" title="Alle Dateien prüfen" v-if="devMode"><font-awesome-icon :icon="((checkAllFiles) ? 'check-square' : 'square')" /></b-btn>
        <b-dropdown size="sm" class="mx-1" right text="Developer - Datei" v-if="devMode">
          <b-dropdown-item @click="updateData()"><b>Parser und Datei neu laden</b></b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item
            @click="devSelectFile(aFile.fullFileName)"
            :active="aFile.fullFileName === Files.file"
            :class="(aFile.errors > 0 ? 'error' : '') + (aFile.warnings > 0 ?' warning' : '')"
            v-for="(aFile, aKey) in devFiles"
            :key="aKey"
          >
            {{ aFile.errors }} - {{ aFile.file + ((aFile.errors || aFile.warnings) ? ' (Fehler: ' + aFile.errors + ', Warnungen: ' + aFile.warnings + ')' : '')}}
            <span class="float-right bg-warning filechanged" v-if="aFile.changed">C</span>
          </b-dropdown-item>
        </b-dropdown>
        <b-btn @click="update = true" title="Repaint" v-if="devMode"><font-awesome-icon :icon="'eye'" /></b-btn>
        <b-button-group size="sm" class="mx-1" v-if="devMode">
          <b-btn @click="devNextFile(false)" title="Vorherige Datei"><font-awesome-icon icon="angle-left"/></b-btn>
          <b-btn @click="updateData()" title="Parser und Datei neu laden"><font-awesome-icon icon="sync-alt"/></b-btn>
          <b-btn @click="devNextFile()" title="Nächste Datei"><font-awesome-icon icon="angle-right"/></b-btn>
        </b-button-group>
        <b-input-group size="sm" class="w-25 mx-1" :prepend="'Datei' + ((Files.changed) ? '!' : '')">
          <p class="form-control file-name" :title="Files.file">{{ Files.file }}</p>
          <b-input-group-append>
            <b-btn @click="showFile()" variant="outline-secondary" title="Ordner in Explorer öffnen" :disabled="!Files.file"><font-awesome-icon icon="external-link-alt"/></b-btn>
          </b-input-group-append>
        </b-input-group>
        <div class="mr-2 mil-auto p-1">
          <font-awesome-icon @click="scrollToTop" style="cursor:pointer;" v-if="aTab === 0" :class="dataStatus === 'ok' ? 'text-success' : dataStatus === 'error' ? 'text-danger' : 'text-warning'" :icon="dataStatus === 'ok' ? 'check' : 'exclamation-triangle'"/>
        </div>
        <b-button-group size="sm" class="mr-1">
          <b-btn @click="saveFileClick()"
                :title="((!Files.changed) ? 'Datei unverändert.' : ((dataStatus === 'ok') ? 'Datei kann gespeichert werden.' : ((dataStatus === 'error') ? 'Datei enthält Fehler!' : 'Datei enthält Warnungen!')))"
                :variant="((!Files.changed) ? 'secondary' : ((dataStatus === 'ok') ? 'success' : ((dataStatus === 'error') ? 'danger' : 'warning')))" v-b-tooltip.hover.html :disabled="tabsLocked"><font-awesome-icon icon="save"/></b-btn>
          <b-btn @click="$store.dispatch('TOGGLE_SHOW', 'autosave')" :title="((Options.show.autosave) ? 'Es wird automatisch alle 5 Minuten gespeichert!' : 'Manuell speichern!')" variant="secondary" v-b-tooltip.hover.html><font-awesome-icon :icon="((Options.show.autosave) ? 'hourglass' : 'mouse-pointer')"/></b-btn>
          <b-btn @click="discardChanges" :title="((Files.changed) ? 'Änderungen verwerfen und zurück zur Auswahl!' : 'Zurück zur Auswahl')" :variant="((Files.changed) ? 'warning' : 'secondary')" v-b-tooltip.hover.html><font-awesome-icon icon="minus-circle"/></b-btn>
        </b-button-group>
      </b-button-toolbar>

      <!-- Tabs -->
      <b-tabs v-model="aTab" content-class="tabc" nav-class="rel">

        <b-tab title="Editor" :disabled="tabsLocked">
          <div class="viewpreview scroll p20 editorpreview w-50" v-if="aTabCach.indexOf(0) > -1 && !update && Options.show.editorPreview">
            <ViewPreview
              v-if="editorObject && editorObject.contentObj"
              :start="true"
              :filename="Files.file"
              :object="editorObject"
              :options="Options"
              />
            <div class="alert alert-danger" role="alert" v-else>Kein <b>Editor Objekt</b> vorhanden!</div>
          </div>
          <div ref="vieweditorobject" :class="'vieweditorobject scroll p20' + ((Options.show.editorPreview) ? ' w-50' : '')" v-if="aTabCach.indexOf(0) > -1 && !update">
            <ViewEditor :object="editorObject" @setTipLine="setTipLine" v-if="editorObject && editorObject.contentObj"/>
            <div class="alert alert-danger" role="alert" v-else>Kein <b>Editor Objekt</b> vorhanden!</div>
          </div>
        </b-tab>

        <b-tab title="Vorschau" :disabled="tabsLocked">
          <div class="viewpreview scroll p20" v-if="aTabCach.indexOf(1) > -1 && !update && !updatePreview">
            <ViewPreview
              v-if="editorObject && editorObject.contentObj"
              :start="true"
              ref="ViewPreview"
              :filename="Files.file"
              :options="Options"
              :object="editorObject"
              :commentsListe="commentsListe"
              :showAnchors="Options.show.showAnchors"
              :showComments="Options.show.showComments" />
            <div class="alert alert-danger" role="alert" v-else>Kein <b>Editor Objekt</b> vorhanden!</div>
          </div>
        </b-tab>

        <b-tab title="Objekt" :title-item-class="{'error': (!editorObject || (editorObject.errors && Object.keys(editorObject.errors).length > 0)), 'hidden': !devMode}" :disabled="tabsLocked">
          <div class="viewobject scroll p20" v-if="aTabCach.indexOf(2) > -1 && !update">
            <div v-if="editorObject">todo ...</div>
            <div class="alert alert-danger" role="alert" v-else>Kein <b>Editor Objekt</b> vorhanden!</div>
          </div>
        </b-tab>

        <b-tab title="XML Editor"
          :title-item-class="{'professional': true, 'hidden': !Options.show.professional, 'error': (!xmlObject || (xmlObject.errors && Object.keys(xmlObject.errors).length > 0))}"
          :disabled="tabsLocked && !xmlEditorLocked"
        >
          <div class="viewxml lh95vh ohidden" v-if="aTabCach.indexOf(3) > -1 && aTab === 3 && !update">
            <ViewXML :xmlString="editorObject.getXML()" :orgXmlString="Files.fileContent" @changed="xmlChanged" @refresh="xmlRefresh" v-if="editorObject"/>
            <div class="alert alert-danger mi20" role="alert" v-else>Kein <b>Editor Objekt</b> vorhanden!</div>
          </div>
        </b-tab>

        <b-tab title="Parser Object"
          :title-item-class="{'develope': true, 'hidden': !Options.show.develope, 'error': (!Parser.parser || (Parser.parser.errors && Object.keys(Parser.parser.errors).length > 0))}"
          :disabled="tabsLocked"
        >
          <div class="viewparser scroll p20" v-if="aTabCach.indexOf(4) > -1 && !update">
            <ViewParser :parser="Parser.parser" v-if="Parser.parser && Parser.parser.content.length > 0"/>
            <div class="alert alert-danger" role="alert" v-else>Kein <b>parser</b> vorhanden!</div>
          </div>
        </b-tab>

        <b-tab title="XML Object" :title-item-class="{'develope': true, 'hidden': !Options.show.develope, 'error': (!xmlObject || (xmlObject.errors && Object.keys(xmlObject.errors).length > 0))}" :disabled="tabsLocked">
          <div class="viewxmlobject scroll p20" v-if="aTabCach.indexOf(5) > -1 && !update">
            <ViewXmlObject :object="xmlObject" v-if="xmlObject"/>
            <div class="alert alert-danger" role="alert" v-else>Kein <b>XML Objekt</b> vorhanden!</div>
          </div>
        </b-tab>

        <b-tab title="Editor Object" :title-item-class="{'develope': true, 'hidden': !Options.show.develope, 'error': (!editorObject || (editorObject.errors && Object.keys(editorObject.errors).length > 0))}" :disabled="tabsLocked">
          <div class="vieweditorobject scroll p20" v-if="aTabCach.indexOf(6) > -1 && !update">
            <ViewEditorObject :object="editorObject" v-if="editorObject && editorObject.contentObj"/>
            <div class="alert alert-danger" role="alert" v-else>Kein <b>Editor Objekt</b> vorhanden!</div>
          </div>
        </b-tab>

        <!-- Ansicht Einstellungen (eye) -->
        <template slot="tabs-end">
          <li class="nav-item extra">
            <b-button size="sm" @click="xmlEditorSet" v-if="aTab === 3" variant="primary" :disabled="!xmlEditorLocked">Anwenden</b-button>
            <b-button size="sm" @click="xmlEditorUnset" v-if="aTab === 3" variant="warning" :disabled="!xmlEditorLocked">Verwerfen</b-button>
            <b-button size="sm" @click="showTabView = !showTabView" class="vis-dropdown-button" title="Ansicht"><font-awesome-icon icon="eye"/></b-button>
            <div class="vis-dropdown" v-if="showTabView">
              <template v-if="aTab === 0">
                <button @click="$store.dispatch('TOGGLE_SHOW', 'warnings')"><font-awesome-icon :icon="((Options.show.warnings) ? 'eye' : 'eye-slash')"/> Warnungen anzeigen</button>
                <button @click="$store.dispatch('TOGGLE_SHOW', 'commentsHighlight')"><font-awesome-icon :icon="((Options.show.commentsHighlight) ? 'check-square' : 'square')"/> Kommentare hervorheben</button>
                <button @click="$store.dispatch('TOGGLE_SHOW', 'editorPreview')"><font-awesome-icon icon="columns" :class="!Options.show.editorPreview ? 'text-secondary' : ''"/> Vorschau anzeigen</button>
                <button @click="$store.dispatch('TOGGLE_SHOW', 'tipLine')"><font-awesome-icon icon="minus" :class="!Options.show.tipLine ? 'text-secondary' : ''"/> Tippzeile anzeigen</button>
                <button @click="$store.dispatch('TOGGLE_SHOW', 'hideIpaKeyboard')"><font-awesome-icon icon="font" :class="Options.show.hideIpaKeyboard ? 'text-secondary' : ''"/> IPA Tastatur anzeigen</button>
                <hr>
              </template>
              <template v-if="aTab === 1">
                <button @click="$store.dispatch('TOGGLE_SHOW', 'showAnchors')"><font-awesome-icon :icon="((Options.show.showAnchors) ? 'eye' : 'eye-slash')"/> Anker anzeigen</button>
                <button @click="$store.dispatch('TOGGLE_SHOW', 'showComments')"><font-awesome-icon :icon="((Options.show.showComments) ? 'eye' : 'eye-slash')"/> Kommentare anzeigen</button>
                <button @click="$store.dispatch('TOGGLE_SHOW', 'showCommentsList')" v-if="Options.show.showComments"><font-awesome-icon :icon="((Options.show.showCommentsList) ? 'eye' : 'eye-slash')"/> Kommentare als Liste</button>
                <hr>
                <button @click="pdfExport"><font-awesome-icon icon="file-pdf"/> Als PDF exportieren</button>
                <hr>
              </template>
              <template v-if="aTab === 3">
                <button @click="$store.dispatch('TOGGLE_SHOW', 'monacoDiff')"><font-awesome-icon :icon="((Options.show.monacoDiff) ? 'eye' : 'eye-slash')"/> Änderungen anzeigen</button>
                <hr>
              </template>
              <template v-if="aTab === 5">
                <button @click="$store.dispatch('TOGGLE_SHOW', 'xmlObjectUselessTypes')"><font-awesome-icon :icon="((Options.show.xmlObjectUselessTypes) ? 'eye' : 'eye-slash')"/> Unbrauchbare Nodes</button>
                <hr>
              </template>
              <template v-if="aTab === 6">
                <button @click="$store.dispatch('TOGGLE_SHOW', 'editorObjectWithoutParser')"><font-awesome-icon :icon="((Options.show.editorObjectWithoutParser) ? 'eye' : 'eye-slash')"/> Ohne Parser</button>
                <hr>
              </template>
              <button @click="$store.dispatch('TOGGLE_SHOW', 'professional')"><font-awesome-icon :icon="((Options.show.professional) ? 'eye' : 'eye-slash')"/> Professional</button>
              <button @click="$store.dispatch('TOGGLE_SHOW', 'develope')"><font-awesome-icon :icon="((Options.show.develope) ? 'eye' : 'eye-slash')"/> Developer</button>
              <template v-if="Options.show.develope">
                <hr>
                <button @click="openDevTool(); showTabView = false"><font-awesome-icon icon="external-link-alt"/> Dev Tool</button>
              </template>
            </div>
          </li>
        </template>

      </b-tabs>
    </div>
    <div class="tip-line">{{ tipLine }}</div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import { mapState } from 'vuex'
  import ViewXML from './ToolPage/ViewXML'
  import ViewEditor from './ToolPage/ViewEditor'
  import ViewPreview from './ToolPage/ViewPreview/ViewPreview'
  // import ViewPreview from '../../../../redaktionstool-view-preview/ViewPreview.vue'
  import ViewParser from './ToolPage/ViewParser'
  import ViewXmlObject from './ToolPage/ViewXmlObject'
  import ViewEditorObject from './ToolPage/ViewEditorObject'
  import { remote, shell } from 'electron'
  import XmlObject from '@/functions/xml/Xml'
  import EditorObject from '@/functions/editor/Editor'
  import fPath from 'path'
  const ipc = require('electron').ipcRenderer
  const path = require('path')
  const { dialog } = remote

  const fs = remote.require('fs')
  const currentWindow = remote.getCurrentWindow()

  export default {
    name: 'tool-page',
    data () {
      return {
        aTab: ((process.env.NODE_ENV === 'development') ? 0 : 0),
        updatePreview: true,
        aTabCach: [],
        showTabView: false,
        xmlObject: null,
        editorObject: null,
        updateTimer: performance.now(),
        devMode: (process.env.NODE_ENV === 'development'),
        checkAllFiles: false,
        devFiles: null,
        update: false,
        updateScrollTop: null,
        xmlEditorLocked: false,
        xmlEditorNewContent: '',
        tipLine: '',
        commentsListe: {
          comments: {}
        },
        autoSave: null,
      }
    },
    // beforeCreate () {
    //   this.xmlObject = null
    //   this.editorObject = null
    // },
    mounted () {
      var t0 = performance.now()
      this.update = true
      if (!this.Parser.parser) {
        this.$store.dispatch('LOAD_PARSER_FILE')		// Parser Datei laden und Parser Objekt erstellen
      }
      if (!this.Files.file) {
        if (this.devMode && this.Options.lastFile && this.Options.lastFile) {
          this.$store.dispatch('LOAD_FILE', this.Options.lastFile)		// Datei laden
        } else {
          this.$router.push('/home')
        }
      }
      if (!this.Files.file) {
        this.$router.push('/home')
      }
      this.loadData()
      if (this.devMode) {
        this.devFiles = this.devFileList()
      }
      this.autoSaveFile()
      console.log('Parser', this.Parser)
      console.log('ToolPage mounted - ' + Math.ceil(performance.now() - t0) + ' ms.')
    },
    computed: {
      ...mapState(['Options']),
      ...mapState(['Parser']),
      ...mapState(['Files']),
      tabsLocked () {
        return (this.xmlEditorLocked)
      },
      dataStatus () {
        if (this.Parser.parser && this.xmlObject && this.editorObject) {
          if (Object.keys(this.Parser.parser.errors).length > 0
            || Object.keys(this.xmlObject.errors).length > 0
            || Object.keys(this.editorObject.errors).length > 0) {
              return 'error'
            } else {
              if (Object.keys(this.Parser.parser.warnings).length > 0
                || Object.keys(this.xmlObject.warnings).length > 0
                || Object.keys(this.editorObject.warnings).length > 0) {
                  return 'warning'
                } else {
                  return 'ok'
                }
            }
        } else {
          return 'error'
        }
      },
    },
    watch: {
      aTab (nVal) {
        this.tipLine = ''
        if (this.aTabCach.indexOf(nVal) < 0) {
          this.aTabCach.push(nVal)
        }
        if (nVal === 1) {
          this.updatePreview = false
          this.$nextTick(() => {
            if (this.$refs.ViewPreview) {
              this.$refs.ViewPreview.commentsListeReset()
            }
          })
        } else {
          this.updatePreview = true
        }
      },
      'Options.show.showCommentsList' (nVal) {
        this.$nextTick(() => {
          this.$refs.ViewPreview.commentsListeReset()
        })
      },
      update (nVal) {
        if (nVal) {
          this.aTabCach = [this.aTab]
          this.$nextTick(() => {
            _.debounce(() => {
              console.log('Do update! Now!')
              this.update = false
              this.$nextTick(() => {
                if (this.updateScrollTop && this.$refs.vieweditorobject) {
                  this.$refs.vieweditorobject.scrollTop = this.updateScrollTop
                  this.updateScrollTop = null
                }
              })
            }, 150)()
          })
        }
      },
    },
    methods: {
      pdfExport () {
        let aDate = new Date()
        let aMonth = aDate.getMonth() + 1
        let now = aDate.getFullYear() + '-' + ((aMonth < 10) ? '0' : '') + aMonth + '-' + ((aDate.getDate() < 10) ? '0' : '') + aDate.getDate()
        now += '_' + ((aDate.getHours() < 10) ? '0' : '') + aDate.getHours() + '_' + ((aDate.getMinutes() < 10) ? '0' : '') + aDate.getMinutes() + '_' + ((aDate.getSeconds() < 10) ? '0' : '') + aDate.getSeconds()
        let oFilename = path.basename(this.Files.file)
        let aExtension = path.extname(this.Files.file)
        let nFilename = oFilename.substring(0, oFilename.length - aExtension.length)
        nFilename += '_' + now
        var newPDF = dialog.showSaveDialog({
          title: 'PDF speichern ...',
          defaultPath: nFilename,
          filters: [
            { name: 'PDF', extensions: ['pdf'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        })
        if (newPDF) {
          ipc.send('print-to-pdf', newPDF)
        }
      },
      changeCall () {
        console.log('ToolPage - changeCall', this)
        this.$store.dispatch('IS_CHANGED')
      },
      saveFileClick () {
        if (Object.keys(this.xmlObject.errors).length > 0) {
          alert('Fehler beim laden der XML-Datei! Speichern nicht möglich!')
        } else {
          if (this.dataStatus === 'ok'
          || (this.dataStatus === 'error' && confirm('Daten enthalten Fehler! Wiklich speichern?'))
          || (this.dataStatus === 'warning' && confirm('Daten enthalten Warnungen! Wiklich speichern?'))) {
            this.saveFile()
            if (this.$refs.vieweditorobject && this.$refs.vieweditorobject.scrollTop) {
              this.updateScrollTop = this.$refs.vieweditorobject.scrollTop
            }
            this.loadData()
          }
        }
      },
      autoSaveFile () {
        this.autoSave = setInterval(() => {
          if (this.Options.show.autosave && this.Files.changed) {
            console.log('autoSaveFile')
            this.saveFile()
          }
        }, 300000)
      },
      saveFile () {
        if (Object.keys(this.xmlObject.errors).length === 0) {
          let aXML = this.editorObject.getXML()
          let sXML = (new EditorObject.EditorBase(this.Parser.parser, new XmlObject.XmlBase(aXML))).getXML()	// Doppelt parsen für "xml:id" init
          this.$store.dispatch('SAVE_FILE', sXML)
        }
      },
      scrollToTop () {
        if (this.$refs.vieweditorobject) {
          this.$refs.vieweditorobject.scrollTop = 0
        }
      },
      discardChanges () {
        if (!this.Files.changed || confirm('Aktuelle Änderungen wirklich verwerfen?')) {
          this.$store.dispatch('NOT_CHANGED')
          this.$router.push('/home')
        }
      },
      showFile () {		// Ordner in Explorer öffnen
        shell.showItemInFolder(this.Files.file)
      },
      xmlRefresh () {
        this.update = true
      },
      xmlChanged (val) {
        this.xmlEditorNewContent = val
        this.xmlEditorLocked = true
      },
      xmlEditorSet () {
        let xmlObject = new XmlObject.XmlBase(this.xmlEditorNewContent, this.changeCall)		// XML Objekt erstellen
        let editorObject = new EditorObject.EditorBase(this.Parser.parser, xmlObject, this.changeCall)		// Editor Objekt erstellen
        console.log(xmlObject, editorObject)
        if (Object.keys(xmlObject.errors).length === 0) {
          if (Object.keys(editorObject.errors).length === 0) {
            this.xmlObject = xmlObject
            this.editorObject = editorObject
            this.update = true
            this.xmlEditorLocked = false
            this.$store.dispatch('IS_CHANGED')
          } else {
            alert('Es gab Fehler bei der Verarbeitung der XML Objekte für den Editor!')
            console.log(xmlObject.errors)
          }
        } else {
          alert('Es gab Fehler bei der Verarbeitung der XML Daten!')
          console.log(xmlObject.errors)
        }
      },
      xmlEditorUnset () {
        if (confirm('Änderungen im XML-Editor verwerfen?')) {
          this.update = true
          this.xmlEditorLocked = false
        }
      },
      toggleCheckAllFiles () {
        this.checkAllFiles = !this.checkAllFiles
        this.devFiles = this.devFileList()
      },
      devFileList () {
        let t0 = performance.now()
        let aFiles = []
        if (this.devMode && this.Files.file) {
          let aPath = this.Files.file.substr(0, this.Files.file.length - this.Files.file.split('\\').pop().split('/').pop().length)
          fs.readdirSync(aPath).forEach(function (file) {
            let aFullFileName = fPath.join(aPath, file)
            if (!fs.statSync(aFullFileName).isDirectory()) {
              let aExt = file.split('.').pop()
              if (aExt === 'xml' && file.substr(0, 6) !== 'parser') {
                if (this.checkAllFiles) {
                  let aFileContent = fs.readFileSync(aFullFileName, 'utf8').replace(/\r/gmi, '')
                  let editorObj = new EditorObject.EditorBase(this.Parser.parser, new XmlObject.XmlBase(aFileContent))
                  aFiles.push({ 'file': file, 'fullFileName': aFullFileName, 'errors': Object.keys(editorObj.errors).length, 'warnings': Object.keys(editorObj.warnings).length, 'changed': (editorObj.getXML() !== aFileContent) })
                } else {
                  aFiles.push({ 'file': file, 'fullFileName': aFullFileName, 'errors': 0, 'warnings': 0, 'changed': false })
                }
              }
            }
          }, this)
        }
        console.log('devFileList() - ' + Math.ceil(performance.now() - t0) + ' ms.')
        return aFiles
      },
      devNextFile (next = true) {
        if (this.devMode) {
          var aList = ((next) ? this.devFiles : this.devFiles.slice().reverse())
          var aPos = -1
          aList.some(function (aVal, aKey) {
            if (aVal.fullFileName === this.Files.file) {
              aPos = aKey
              return true
            }
          }, this)
          aPos = ((aPos >= 0 && aPos < aList.length - 1) ? aPos + 1 : 0)
          this.devSelectFile(aList[aPos].fullFileName)
        }
      },
      devSelectFile (file) {
        if (this.devMode && file) {
          var t0 = performance.now()
          this.$store.dispatch('LOAD_FILE', file)
          this.loadData()
          console.log('devSelectFile - ' + Math.ceil(performance.now() - t0) + ' ms.')
        }
      },
      loadData () {
        if (this.Files.fileContent) {
          this.xmlObject = new XmlObject.XmlBase(this.Files.fileContent, this.changeCall)		// XML Objekt erstellen
        } else {
          this.xmlObject = null
        }
        if (this.Parser.parser && this.xmlObject) {
          this.editorObject = new EditorObject.EditorBase(this.Parser.parser, this.xmlObject, this.changeCall)		// Editor Objekt erstellen
        } else {
          this.editorObject = null
        }
        this.update = true
      },
      updateData () {
        this.$store.dispatch('RELOAD_PARSER_FILE')
        this.$store.dispatch('RELOAD_FILE')
        this.loadData()
        if (this.devMode) {
          this.devFiles = this.devFileList()
        }
      },
      mousedown (e) {
        if (this.showTabView && !(e.target.closest('.vis-dropdown') || e.target.closest('.vis-dropdown-button'))) {
          this.showTabView = false
        }
      },
      openDevTool () {
        currentWindow.webContents.openDevTools()
      },
      setTipLine (aTipLine) {
        this.tipLine = aTipLine
      },
    },
    created () {
      window.addEventListener('mousedown', this.mousedown)
    },
    beforeUpdate () {
      this.updateTimer = performance.now()
    },
    updated () {
      let aUpdDur = Math.ceil(performance.now() - this.updateTimer)
      if (aUpdDur > 50) {
        console.log('ToolPage - updated: ' + aUpdDur + ' ms.')
      }
    },
    beforeDestroy () {
      clearInterval(this.autoSave)
      window.removeEventListener('mousedown', this.mousedown)
    },
    components: {
      ViewEditor,
      ViewPreview,
      ViewXML,
      ViewParser,
      ViewXmlObject,
      ViewEditorObject,
    }
  }
</script>

<style>
  .tool-page {
    margin-top: 10px;
  }
  .vieweditorobject {
    font-size: 1.06rem;
  }
  .vieweditorobject .btn {
    font-size: 1.06rem;
  }
  .layout-attr .btn {
    font-size: 12px !important;
    line-height: 1.4 !important;
  }
  .editorpreview {
    float: right;
    border-left: 1px solid #eee;
  }
  .tabc {
    border: 1px solid #eee;
    border-top: none;
    height: calc( 100vh - 190px );
  }
  .lh95vh, .tabc > div > .scroll {
    height: calc( 100vh - 191px );
    position: relative;
  }
  .toolbar {
    margin-bottom: 0px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
    padding: 8px 7px;
  }
  .main-toolbar {
    margin-bottom: 10px;
  }
  .fal-br {
    transform: translate(9px, 8px);
    color: #fff;
  }

  li.nav-item.extra {
    position: absolute;
    right: 0;
    padding: 5px;
  }
  li.nav-item.extra > a {
    border: none !important;
  }
  li.nav-item.extra > button {
    margin-left: 5px;
  }

  li.nav-item > a {
    position: relative;
  }
  li.nav-item.develope > a {
    color: #5ca9fb;
  }
  li.nav-item.develope > a:after, li.nav-item.professional > a:after {
    position: absolute;
    top: -1px;
    right: 3px;
    font-size: 10px;
  }
  li.nav-item.develope > a:after {
    content: "Dev";
    color: #fd7a7a;
  }
  li.nav-item.professional > a:after {
    content: "Pro";
    color: #fbbe60;
  }

  li.nav-item.error > a:before {
    content: "!";
    position: absolute;
    top: -9px;
    right: -9px;
    font-size: 14px;
    color: #fff;
    background: #dc3545;
    width: 19px;
    height: 19px;
    text-align: center;
    line-height: 1.24;
    border-radius: 100%;
  }

  .vis-dropdown {
    position: absolute;
    right: 5px;
    top: calc( 100% - 2px );
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
    z-index: 5000;
  }
  .vis-dropdown > hr {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
  .vis-dropdown > button {
    white-space: nowrap;
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    margin-bottom: 2px;
    border: none;
    cursor: pointer;
  }
  .vis-dropdown > button:hover, .vis-dropdown > button:focus {
    background: #eef;
  }
  .vis-dropdown > button > svg {
    width: 1.25em !important;
    margin: 0 2px;
  }
  p.form-control.file-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    direction: rtl;
    text-align: left;
    height: 100%;
    padding: 0.45rem 0.5rem;
  }

  a.dropdown-item.warning {
    background: #ffe !important;
  }
  a.dropdown-item.active.warning {
    background: #dcdc45 !important;
  }
  a.dropdown-item.error {
    background: #fee !important;
  }
  a.dropdown-item.active.error {
    background: #dc3545 !important;
  }

  .tip-line {
    color: #aaa;
    margin: 0 20px;
    overflow: hidden;
    white-space: nowrap;
    direction: rtl;
    text-align: left;
    text-overflow: ellipsis;
  }
  .tip-line:after {
    content: "X";
    color: #fff;
    font-size: 2px;
  }
  .filechanged {
    margin-right: -24px;
    padding: 0 0.3rem;
  }
  .viewpreview, .vieweditorobject {
    font-family: 'fiduz' !important;
  }
  @media print {
    .viewpreview {
      height: inherit!important;
      z-index: 999999;
      position: relative;
      background: #fff;
      overflow: visible;
      padding-left: 0;
      padding-right: 0;
    }
    .tabc {
      border: none!important;
      height: inherit!important;
    }
    .tabs .nav-tabs {
      display: none!important;
    }
    .main-toolbar {
      display: none!important;
    }
  }
</style>
