<template>
  <div class="start-page mib50">
    <div class="container">
      <br>
      <b-alert show variant="danger" v-if="filesystem && filesystem.errors && Object.keys(filesystem.errors).length > 0">
        <ul class="my-0">
          <li v-for="(err, i) in filesystem.errors" :key="'e' + i"><b>{{ i }}:</b> {{ err }}</li>
        </ul>
      </b-alert>
      <div class="project-path" v-if="Options.projectPath">
        <p v-if="Files.file">
          <span :title="'Geöffnete Datei: ' + Files.file"><font-awesome-icon icon="book-open" class="mir10"/> {{ Files.file.split('\\').pop().split('/').pop() }}</span>
          <button @click="goToTool" class="mir5"><font-awesome-icon icon="edit"/></button>
          <button @click="$store.dispatch('UNSET_FILE')" class="mir5"><font-awesome-icon icon="times"/></button>
        </p>
        <p>
          <!-- Projektpfad -->
          <font-awesome-icon icon="project-diagram" class="mir10"/> {{ Options.projectPath }}
          <button @click="selectFolder" title="Verzeichniss ändern"><font-awesome-icon icon="edit" class="mil5 mir5"/></button>
          <button @click="showFolder" title="Ordner in Explorer öffnen"><font-awesome-icon icon="external-link-alt" class="mil5 mir5"/></button>
          <button @click="updateFolder" title="Projektpfad neu laden"><font-awesome-icon icon="sync-alt" class="mil5 mir5"/></button>
          <!-- Parser -->
          <button @click="reloadParser" title="Parser-Datei neu laden" class="float-right mir5"><font-awesome-icon icon="sync-alt"/></button>
          <button @click="showParser" :title="'Parser-Datei in Explorer anzeigen\n' + Parser.file" class="float-right mir5" v-if="Parser.file && !(Parser.file.indexOf('app.asar') > -1)"><font-awesome-icon icon="external-link-alt"/></button>
          <button @click="parserPath" :title="'Verzeichniss für Parser auswählen\n' + Options.parserPath" :class="'float-right mir5' + (Options.parserPath ? '' : ' warning')"><font-awesome-icon icon="external-link-square-alt"/></button>
          <span class="float-right mir10">
            Parser: <b>{{ Parser.parser ? (Parser.parser.type + '-' + Parser.parser.version) : 'Kein Parser' }}</b>
          </span>
        </p>
        <div>
          <b-input-group size="sm" class="my-3">
            <b-form-input type="text" placeholder="Filter ..." v-model="filterFile"></b-form-input>
          </b-input-group>
        </div>
        <div>
          <FileLine :fileobject="filesystem.paths" :filesystem="filesystem" @loadfile="loadFile" @new="newFile" :filterFile="filterFile" v-if="filesystem" />
        </div>
      </div>
      <b-alert show variant="danger" v-else>Projektpfad nicht vergeben!</b-alert>
      <div id="loading" v-if="loading">Lade ...</div>
      <b-modal ref="modalNewFile" title="Neue Datei Erstellen:" @ok="newFileModalOk" cancel-title="Abbrechen" ok-title="Datei erstellen" centered>
        <p>Wie soll die Datei, die im Verzeichniss "{{ newFilePath }}" erstellt werden soll, heißen?</p>
        <form @submit.stop.prevent="">
          <b-form-input type="text" placeholder="Neuer Dateiname ..." v-model="newFileName"></b-form-input>
        </form>
      </b-modal>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import { mapState } from 'vuex'
  import FileLine from './StartPage/FileLine'
  import fPath from 'path'

  const { shell, remote } = require('electron')
  const fs = remote.require('fs')

  export default {
    name: 'start-page',
    props: {
      filesystem: Object
    },
    data () {
      return {
        loading: false,
        newFilePath: '',
        newFileName: '',
        filterFile: ''
      }
    },
    mounted () {
      this.loading = true
      this.updateFolder()
      this.loading = false
    },
    computed: {
      ...mapState(['Options']),
      ...mapState(['Parser']),
      ...mapState(['Files'])
    },
    methods: {
      goToTool () {		// Zu Tool wechseln
        this.loading = true
        this.debouncedgoToTool()
      },
      debouncedgoToTool: _.debounce(function () {		// Verzögert öffnen damit "Laden ..." angezeigt wird
        this.$router.push('/tool')		// Tool öffnen
      }, 50),
      selectFolder () {		// Projektpfad auswählen und speichern
        this.loading = true
        this.$store.dispatch('DIALOG_PROJECT_PATH')	// Verzeichniss Dialog
        this.$store.dispatch('SET_PROJECT_PATH')		// Projektpfad speichern
        this.updateFolder()
        this.loading = false
      },
      showFolder () {		// Ordner in Explorer öffnen
        shell.openItem(this.Options.projectPath)
      },
      loadFile (d) {
        console.log('loadFile', d)
        this.loading = true
        this.$nextTick(() => {
          _.debounce(() => {
            console.log('xxx')
            this.$store.dispatch('LOAD_FILE', d)		// Datei laden
            // Nur Tool öffnen wenn Datei lesbar!
            this.$router.push('/tool')		// Tool öffnen
          }, 100)()
        })
      },
      updateFolder () {		// Projektpfad neu laden
        if (this.filesystem && this.filesystem.updatePaths) {
          this.filesystem.updatePaths(true)
        }
      },
      showParser () {		// Parser-Datei in Explorer anzeigen
        shell.showItemInFolder(this.Parser.file)
      },
      parserPath () {
        console.log('parserPath')
        this.loading = true
        this.$store.dispatch('DIALOG_PARSER_FILES_DIRECTORY')	// Verzeichniss Dialog
        this.$store.dispatch('SET_PARSER_PATH')
        this.loading = false
      },
      reloadParser () {
        this.$store.dispatch('RELOAD_PARSER_FILE')	// "parser.xml" neu laden
        this.updateFolder()
      },
      newFile (nf) {
        this.newFilePath = nf
        this.newFileName = ''
        this.$refs.modalNewFile.show()
      },
      newFileModalOk (e) {
        if (this.newFileName.length === 0) {
          e.preventDefault()
          alert('Es muss ein Dateiname eingegeben werden!')
        } else {
          let nfn = fPath.join(this.newFilePath, this.newFileName + ((this.newFileName.substr(-4) !== '.xml') ? '.xml' : ''))
          if (fs.existsSync(nfn)) {
            e.preventDefault()
            alert('Dateiname "' + this.newFileName + '" existiert bereits!')
          } else {
            this.$store.dispatch('NEW_FILE', {'filename': nfn, 'parser': this.Parser.parser})
            this.goToTool()
          }
        }
      }
    },
    watch: {
      'Options.projectPath' (nVal) {
        if (nVal) {		// Wenn sich der Projektpfad ändert alle Verzeichnisse zurücksetzen
          this.loading = true
          this.updateFolder()
          this.loading = false
        }
      }
    },
    components: {
      FileLine
    }
  }
</script>

<style scoped>
  button {
    padding: 0px;
    background: none;
    border: none;
  }
  button:not([disabled]) {
    cursor: pointer;
  }
  #loading {
    position: fixed;
    background: rgba(0, 0, 0, 0.25);
    color: #fff;
    text-align: center;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    padding-top: calc( 50vh - 25px );
    font-size: 50px;
    line-height: 1;
  }

  .fileline-btn {
    width: 100%;
    text-align: left;
    margin: 0px;
    padding: 0px;
    background: none;
    border: none;
  }
  .fileline-btn.new-file {
    color: #666;
    font-style: italic;
  }
  .fileline > button.active, .fileline-btn.active {
    color: #33f;
  }
  .fileline-btn:hover {
    color: #000;
    background: #eee;
  }
  .warning {
    color: #ad5900;
  }
</style>
