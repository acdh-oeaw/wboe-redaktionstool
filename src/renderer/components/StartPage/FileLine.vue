<template>
  <div :class="'file' + ((fileobject.isDir && fileobject.isOpen) ? ' open' : '')">
    <div v-if="fileobject.firstFile">
      <button @click="$emit('new', fileobject.path)" title="Neue Datei erstellen ..." class="fileline-btn new-file"><font-awesome-icon icon="asterisk"/><span>Neue Datei erstellen ...</span></button>
    </div>
    <template v-if="!fileobject.file">
      <FileLine :fileobject="fObj" @loadfile="loadFileE" :filesystem="filesystem" @new="newFile" v-for="(fObj, fKey) in fileobject.children" :key="'fl' + fKey" />
    </template>
    <template v-else>
      <div class="pathline" v-if="fileobject.isDir">
        <button @click="toggleMe" :title="fileobject.fullFileName" :class="(Files.file && Files.file.indexOf(fileobject.fullFileName) === 0) ? 'active' : ''">
          <span class="path"><font-awesome-icon :icon="((fileobject.isOpen) ? 'folder-open' : 'folder')" class="mir5"/>{{ fileobject.file }}</span>
          <span class="foldercontent" v-if="!fileobject.update">
            <span class="info">{{ fileobject.children.filter((fO) => !fO.isDir).length.toLocaleString() }} <font-awesome-icon icon="file"/></span>
            <span class="info">{{ fileobject.children.filter((fO) => fO.isDir).length.toLocaleString() }} <font-awesome-icon icon="folder"/></span>
          </span>
          <span class="foldercontent unknown" v-else-if="fileobject.isOpen"><span class="info"><font-awesome-icon icon="sync-alt"/></span></span>
          <span class="foldercontent unknown" v-else><span class="info">? <font-awesome-icon icon="file"/></span><span class="info">? <font-awesome-icon icon="folder"/></span></span>
        </button>
        <div class="subdata" v-if="fileobject.isOpen && !fileobject.update">
          <FileLine :fileobject="fObj" @loadfile="loadFileE" :filesystem="filesystem" @new="newFile" v-for="(fObj, fKey) in fileobject.children" :key="'fl' + fKey" />
          <div v-if="fileobject.children.length === 0">
            <button @click="$emit('new', fileobject.fullFileName)" title="Neue Datei erstellen ..." class="fileline-btn new-file"><font-awesome-icon icon="asterisk"/><span>Neue Datei erstellen ...</span></button>
          </div>
        </div>
        <div class="subdata" v-else-if="fileobject.isOpen">
          Lade Verzeichniss ...
        </div>
      </div>
      <div class="fileline" v-else>
        <button :id="'fl-' + _uid" @click="loadFile()" :title="fileobject.fullFileName" :class="(isActiveFile ? 'active' : '') + (isParser ? ' italic' : '')">
          <span class="file"><font-awesome-icon :icon="((isParser) ? 'project-diagram' : ((isActiveFile) ? 'book-open' : 'file'))" class="mir5"/>{{ fileobject.file }}</span>
          <span class="filesize">{{ fileobject.size | prettyBytes }}</span>
          <span class="info" v-if="fileobject.info">
            <span v-if="fileobject.info.changed" style="color:#9a0000;"><b>Anpassen!</b></span>
            <span>Fehler: <b>{{ fileobject.info.errors }}</b></span>
            <span>Warnungen: <b>{{ fileobject.info.warnings }}</b></span>
            <span :id="'fl-c-' + _uid">Kommentare: <b>{{ fileobject.info.comments }}</b></span>
          </span>
          <span class="info" v-if="fileobject.loading">
            <span><font-awesome-icon icon="sync-alt"/></span>
          </span>
          <span class="info" v-if="fileobject.sInfo && !fileobject.loading">
            <span :id="'fl-err-' + _uid" style="width:120px; color: red;" v-if="fileobject.sInfo && fileobject.sInfo.errors && fileobject.sInfo.errors.length > 0"><b>Fehler: {{ fileobject.sInfo.errors.length }}</b></span>
            <span style="width:120px;"><b>{{ fileobject.sInfo.status }}</b></span>
            <span style="width:150px;"><b>{{ fileobject.sInfo.editor }}</b></span>
            <span style="width:50px;"><b>{{ fileobject.sInfo.version }}</b></span>
            <span style="width:70px;"><b>{{ fileobject.sInfo.parserVersion }}</b></span>
            <span :id="'fl-c-' + _uid" style="width:40px; text-align: right;"><b>{{ fileobject.sInfo.comments && fileobject.sInfo.comments.length }}</b></span>
          </span>
          <b-tooltip :target="'fl-c-' + _uid" placement="topleft" triggers="hover" class="tooltipcomment" v-if="fileobject.sInfo && fileobject.sInfo.comments && fileobject.sInfo.comments.length > 0">
            <ul class="comment-list-el">
              <li class="comment-el" v-for="(aComment, aComKey) in fileobject.sInfo.comments" :key="'flcott' + _uid + '-' + aComKey">
                {{ aComment }}
              </li>
            </ul>
          </b-tooltip>
          <b-tooltip :target="'fl-err-' + _uid" placement="topright" triggers="hover" class="tooltipcomment" v-if="fileobject.sInfo && fileobject.sInfo.errors && fileobject.sInfo.errors.length > 0">
            <ul class="comment-list-el">
              <li class="comment-el" v-for="(aErr, aErrKey) in fileobject.sInfo.errors" :key="'flcerr' + _uid + '-' + aErrKey">
                {{ aErr.split('\n').join(' | ') }}
              </li>
            </ul>
          </b-tooltip>
        </button>
      </div>
    </template>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'FileLine',
    props: {
      fileobject: Object,
      filesystem: Object
    },
    mounted () {
      // console.log(this.fileobject)
    },
    computed: {
      ...mapState(['Files']),
      isParser () {
        if (this.fileobject.file) {
          return (this.fileobject.file.substr(0, 6) === 'parser')
        }
      },
      isActiveFile () {
        if (this.fileobject.file) {
          return this.Files.file === this.fileobject.fullFileName
        }
      },
    },
    methods: {
      toggleMe () {		// Verzeichniss öffnen/schließen
        if (!this.fileobject.isOpen) {
          this.fileobject.isOpen = true
          this.fileobject.update = true
          this.filesystem.updatePaths(false)
        } else {
          this.fileobject.isOpen = false
        }
      },
      loadFileE (d) {
        this.$emit('loadfile', d)
      },
      loadFile () {		// Lade Datei
        if (!this.isParser) {
          this.$emit('loadfile', this.fileobject.fullFileName)
        }
      },
      newFile (nf) {
        this.$emit('new', nf)
      }
    }
  }
</script>

<style scoped>
  .pathline > button, .fileline > button, .fileline-btn {
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
  .fileline .file > svg, .pathline .path > svg, .fileline-btn > svg {
    width: 1.125em;
    margin: 0 5px;
  }
  .pathline > button.active, .fileline > button.active, .fileline-btn.active {
    color: #33f;
  }
  .pathline > button:hover, .fileline > button:hover, .fileline-btn:hover {
    color: #000;
    background: #eee;
  }
  .foldercontent > .info {
    margin-left: 6px;
  }
  .foldercontent > .info > svg {
    margin-left: 2px;
  }
  .subdata {
    margin-left: 25px;
  }
  button:not([disabled]) {
    cursor: pointer;
  }
  .fileline .info {
    float: right;
    font-size: 12px;
    margin: 0 10px;
  }
  .fileline .info > span {
    width: 100px;
    display: inline-block;
    margin: 0 5px;
  }
  .filesize, .foldercontent {
    float: right;
    font-size: 12px;
    min-width: 100px;
    margin-top: 3px;
    text-align: right;
  }
  .foldercontent.unknown {
    color: #999;
  }
</style>
