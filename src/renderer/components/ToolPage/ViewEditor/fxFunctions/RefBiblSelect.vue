<template>
  <span :id="'rbs' + content.uId" class="rbsmodal">
    <button @click="edit = true" class="btn-none rbsmodalbtn view">
      <PreviewContent :content="content" :fx="{noBefore: true, noAfter: true}"/>
      <font-awesome-icon icon="external-link-alt"/>
    </button>
    <b-modal v-if="edit" ref="editmodal" :id="'rbsmodal' + content.uId" title="Querverweis auf Artikel" @hidden="edit = false" @hide="chancelValue" size="lg" modal-class="modal-xl">
      <div class="row">
        <div class="col-5">
          <div class="card belegselect">
            <div class="card-body">
              <div class="input-group mb-3">
                <input type="text" class="form-control" v-model="search">
                <div class="input-group-append">
                  <button class="btn btn-primary" type="button" @click="debouncedSearching"><font-awesome-icon icon="search"/></button>
                </div>
              </div>
              <button @click="selBeleg = (selBeleg === aBeleg['ID']) ? '' : aBeleg['ID']" :class="'btn btn-sm w-100 mb-1 text-left btn-' + (selBeleg === aBeleg['ID'] ? 'success' : 'primary')"
                :key="'bl' + aKey"
                v-for="(aBeleg, aKey) in belege"
              >
                {{ aBeleg['Kürzel'] }}
              </button>
            </div>
          </div>
        </div>
        <div class="col-7">
          <div class="card anchorselect">
            <div class="card-body">
              <p v-if="selBeleg"><b>ID:</b> {{selBeleg}}</p>
              <template v-if="selBelegObj">
                <p><b>Kürzel:</b> {{ selBelegObj['Kürzel'] }}</p>
                <p><b>Jahr:</b> {{ selBelegObj['Jahr'] }}</p>
                <p><b>Titel:</b><br>{{ selBelegObj['Titel'] }}</p>
                <p><b>Autor - Nachname:</b> {{ selBelegObj['Autor - Nachname'] }}</p>
                <p><b>Vorname:</b> {{ selBelegObj['Vorname'] }}</p>
                <p><b>Kommentar:</b> {{ selBelegObj['Kommentar'] }}</p>
                <p><b>Zotero:</b> {{ selBelegObj['Zotero'] }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div slot="modal-footer" class="w-100">
        <div class="form-row align-items-center">
          <div class="col-3">
            <div class="input-group mb-2">
              <div class="input-group-prepend">
                <div class="input-group-text pr-0">target (ID) #</div>
              </div>
              <input type="text" class="form-control" v-model="selBeleg">
            </div>
          </div>
          <div class="col-2">
            <div class="input-group mb-2">
              <div class="input-group-prepend">
                <div class="input-group-text">lbl</div>
              </div>
              <input type="text" class="form-control" v-model="lbl">
            </div>
          </div>
          <div class="col-3">
            <div class="input-group mb-2">
              <div class="input-group-prepend">
                <div class="input-group-text">Text</div>
              </div>
              <input type="text" class="form-control" v-model="txt">
            </div>
          </div>
          <div class="col-2">
            <div class="input-group mb-2">
              <div class="input-group-prepend">
                <div class="input-group-text">citedRange</div>
              </div>
              <input type="text" class="form-control" v-model="citedRange">
            </div>
          </div>
          <div class="col-2">
            <button type="button" @click="saveValue(); $refs.editmodal.hide();" class="btn btn-primary float-right ml-2 mb-2">OK</button>
            <button type="button" @click="$refs.editmodal.hide()" class="btn btn-secondary float-right mb-2">Cancel</button>
          </div>
        </div>
      </div>
    </b-modal>
  </span>
</template>

<script>
  // import { remote } from 'electron'
  import { mapState } from 'vuex'
  import PreviewContent from '../../ViewPreview/PreviewContent'
  import _ from 'lodash'
  // import XmlObject from '@/functions/xml/Xml'
  // import EditorObject from '@/functions/editor/Editor'

  export default {
    name: 'RefBiblSelect',
    props: {
      content: Object,
    },
    data () {
      return {
        'edit': false,
        'changed': false,
        'search': '',
        'searchDebounced': '',
        'selBeleg': '',
        'lbl': '',
        'txt': '',
        'citedRange': ''
      }
    },
    mounted () {
      // console.log(this.content)
      // console.log(this.content.fxData.belege)
    },
    computed: {
      ...mapState(['Parser']),
      belege () {
        if (this.searchDebounced.trim().length > 0) {
          let aBelege = []
          this.content.fxData.belege.forEach(aBeleg => {
            if (this.selBeleg === aBeleg['ID'] || aBeleg['Kürzel'].toLowerCase().indexOf(this.searchDebounced.trim().toLowerCase()) > -1) {
              aBelege.push(aBeleg)
            }
          })
          return aBelege
        } else {
          return this.content.fxData.belege
        }
      },
      selBelegObj () {
        let aBelegObj = null
        if (this.selBeleg) {
          this.belege.forEach(aBeleg => {
            if (this.selBeleg === aBeleg['ID']) {
              aBelegObj = aBeleg
            }
          })
        }
        return aBelegObj
      }
    },
    watch: {
      'edit' (nVal) {
        if (nVal) {
          this.getBaseData()
          this.$nextTick(() => {
            this.$refs.editmodal.show()
          })
        } else {
          this.selBeleg = ''
          this.lbl = ''
          this.txt = ''
          this.citedRange = ''
          this.changed = false
        }
      },
      'search' () {
        this.debouncedSearching()
      },
      'lbl' () {
        this.changed = true
      },
      'txt' () {
        this.changed = true
      },
      'citedRange' () {
        this.changed = true
      },
      'selBeleg' () {
        this.changed = true
        this.$nextTick(() => {
          if (this.selBeleg === '') {
            this.txt = ''
          }
          if (this.selBelegObj) {
            this.txt = this.selBelegObj['Kürzel']
          }
        })
      },
    },
    methods: {
      getBaseData () {
        this.selBeleg = ''
        this.lbl = ''
        this.txt = ''
        this.citedRange = ''
        // console.log(this.content)
        if (this.content.orgXmlObj && this.content.orgXmlObj.attributes) {
          this.selBeleg = (this.content.orgXmlObj.attributes.target || '#').substr(1)
          let aChilds = this.content.getChilds('all', true)
          aChilds.forEach(function (aChild) {
            if (aChild.orgXmlObj) {
              // console.log(aChild.orgXmlObj)
              if (aChild.orgXmlObj.name === 'lbl') {
                this.lbl = aChild.orgXmlObj.getValue(false) || ''
              } else if (aChild.orgXmlObj.name === '#text') {
                this.txt = aChild.orgXmlObj.getValue(false) || ''
              } else if (aChild.orgXmlObj.name === 'citedRange') {
                this.citedRange = aChild.orgXmlObj.getValue(false) || ''
              }
            }
          }, this)
        }
        this.$nextTick(() => {
          this.changed = false
        })
      },
      saveValue () {
        let aChilds = this.content.getChilds('all', true)
        this.content.orgXmlObj.attributes.target = '#' + this.selBeleg
        aChilds.forEach(function (aChild) {
          if (aChild.orgXmlObj) {
            aChild.delete(true)
          }
        }, this)
        if (this.citedRange) {
          let aCitedRange = this.content.add(0, this.content.parserObj.root.idList['ref-bibl-citedRange'])
          aCitedRange.orgXmlObj.setValue(this.citedRange)
        }
        if (this.txt) {
          let aTxt = this.content.add(0, this.content.parserObj.root.idList['ref-bibl-txt'])
          aTxt.orgXmlObj.setValue(this.txt)
        }
        if (this.lbl) {
          let aLbl = this.content.add(0, this.content.parserObj.root.idList['lbl'])
          aLbl.orgXmlObj.setValue(this.lbl)
        }
        this.changed = false
      },
      chancelValue (e) {
        if (!this.changed || confirm('Änderung verwerfen?')) {
          this.changed = false
        } else {
          e.preventDefault()
        }
      },
      debouncedSearching: _.debounce(function () {		// Verzögert suchen
        this.searchDebounced = this.search
      }, 250),
    },
    created () {
    },
    beforeDestroy () {
    },
    components: {
      PreviewContent,
    },
  }
</script>

<style scoped>
  .rbsmodalbtn.view {
    cursor: pointer;
  }
  .rbsmodal > div, .rbsmodal > div > div {
    display:inline-block;
  }
  .belegselect, .anchorselect {
    height: calc( 100vh - 240px );
    min-height: 300px;
    overflow-y: auto;
  }
  .btn-sm {
    font-size: 0.875rem;
  }
</style>
