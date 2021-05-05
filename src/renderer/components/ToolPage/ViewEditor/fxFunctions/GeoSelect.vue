<template>
  <span v-if="!refreshSelect" :id="'gs' + content.uId">
    <span class="geoselect edit icon-map-marked-black" v-if="edit">
      <span class="gsel mir10" v-for="(place, pKey) in placesEdit" :key="'gselp' + pKey">
        <span class="field-name">
          {{ place.fieldName }}
          <span class="float-right" v-if="!place.option.possible">!</span>
          <font-awesome-icon @click="togglePlaceUse(place)" :icon="((place.use && place.selectedPlace) ? 'check-square' : 'square')" :class="'float-right fa-icon'+((!place.use && place.selectedPlace) ? ' text-warning' : '')" v-else-if="place.option.possible"/>
          <font-awesome-icon icon="eye-slash" class="float-right fa-icon" v-else/>
        </span>
        <b-dropdown variant="val-focus" size="sm" menu-class="mh30vh p-0" ref="dropdown" @shown="dropdownFocusActive(pKey)" @hidden="filter = ''" no-caret>
          <template slot="button-content">
            <span :class="'select mw120px' + ((!place.use && place.selectedPlace) ? ' text-warning' : '') + (!isCorrectPlace(place) ? ' error' : '')">{{ ((placeBySigle(place.places, place.selectedPlace)) ? placeBySigle(place.places, place.selectedPlace).name : 'Auswählen' ) }}&nbsp;<font-awesome-icon icon="caret-down" class="fa-icon float-right"/></span>
          </template>
          <input class="dropdown-filter" @keyup.enter="filterEnter" type="text" ref="filter" v-model="filter" v-if="filter"/>
          <div :class="'dropdown-scrollarea' + (filter ? ' filter' : '')">
            <b-dropdown-item
              @click="setPlace(place, null)"
              :class="((!place.selectedPlace) ? 'active' : '') + (!(!place.option || place.option.possible) ? ' not-possible' : '')"
               v-if="!filter"
            >Keiner</b-dropdown-item>
            <template v-for="(aPlace, apKey) in place.places">
              <b-dropdown-item @click="setPlace(place, aPlace.sigle)" :class="((place.selectedPlace === aPlace.sigle) ? 'active' : '')"
                :key="pKey + '-' + apKey + '-' + aPlace.sigle"
                v-if="(Object.keys(aPlace.parents).length === 0 || isVisiblePlace(aPlace))
                      && (!filter || aPlace.name.toLowerCase().indexOf(filter.toLowerCase()) > -1)"
              >
                {{ aPlace.name }}
              </b-dropdown-item>
            </template>
          </div>
        </b-dropdown>
      </span>
      <button @click="saveValue" class="btn-none fx-btn"><font-awesome-icon icon="check" class="text-success"/></button>
      <button @click="chancelValue" class="btn-none fx-btn"><font-awesome-icon icon="times" class="text-danger"/></button>
      <!-- leere Spans für die Kinder damit die Warnungen zugeordnet werden können!  -->
      <span :id="'eo' + child.uId" v-for="child in content.childs" :key="'eo' + child.uId">
        <span class="error-place" v-if="Object.keys(child.warnings).length > 0 || Object.keys(child.errors).length > 0">{{ child.orgXmlObj.getValueByOption(child.parserObj.options.getOption('value'), false) }}&nbsp;</span>
        <font-awesome-icon icon="exclamation-triangle" class="text-warning" v-if="Object.keys(child.warnings).length > 0 || Object.keys(child.errors).length > 0"/>
      </span>
    </span>
    <button @click="edit = true" class="btn-none geoselect view icon-map-marked-black" v-else>
      <span :style="{ 'line-height': Options.options.lineHeight }">
        <template v-for="(place, pKey) in placesView()">{{ (pKey > 0 ? content.fxData.join : '') + place.orgXmlObj.getValue(false) }}</template>
      </span>
      <!-- leere Spans für die Kinder damit die Warnungen zugeordnet werden können!  -->
      <span :id="'eo' + child.uId" v-for="child in childsWithIssues" :key="'eo' + child.uId">
        <span class="error-place">{{ child.orgXmlObj.getValueByOption(child.parserObj.options.getOption('value'), false) }}&nbsp;</span>
        <font-awesome-icon icon="exclamation-triangle" class="text-warning"/>
      </span>
    </button>
  </span>
</template>

<script>
  import _ from 'lodash'
  import stdFunctions from '@/functions/stdFunctions'

  import { mapState } from 'vuex'

  export default {
    name: 'GeoSelect',
    props: {
      content: Object,
    },
    data () {
      return {
        'refreshSelect': false,
        'edit': false,
        'changed': false,
        'placesEdit': [],
        'filter': '',
      }
    },
    mounted () {
    },
    computed: {
      ...mapState(['Options']),
      childsWithIssues () {
        return this.content.childs.filter(c => Object.keys(c.warnings).length > 0 || Object.keys(c.errors).length > 0)
      }
    },
    methods: {
      test (e) {
        console.log('test', e)
      },
      filterEnter () {
        console.log('filterEnter')
        this.$refs.dropdown.some((aDrDo, aKey) => {
          if (aDrDo.visible) {
            let filteredPlaces = this.placesEdit[aKey].places.filter(p => p.name.toLowerCase().indexOf(this.filter.toLowerCase()) > -1)
            if (filteredPlaces.length === 1) {
              console.log(filteredPlaces[0], this.placesEdit[aKey])
              if (!this.setPlace(this.placesEdit[aKey], filteredPlaces[0].sigle)) {
                this.saveValue()
              }
            }
          }
        })
      },
      getPlacesEdit () {
        let aPlaces = []
        let peRest = false
        this.content.fxData.places.uFields.forEach(function (aField, aFieldKey) {
          let xmlFieldName = this.content.fxData.places.xFields[this.content.fxData.places.pFields.indexOf(aField)]
          let aOption = stdFunctions.getFirstObjectOfValueInPropertyOfArray(this.content.fxData.fields, 'name', aField)
          if (peRest || aOption) {
            // Aktuelle Werte auslesen
            let aManualUse = false
            let aPlaceObj = null
            let aSelectedPlace = null
            this.content.getChilds('all', true).some(function (child) {
              if (child.orgXmlObj.name === 'placeName' && child.orgXmlObj.attributes['ref'] && child.orgXmlObj.attributes.type === xmlFieldName) {
                aPlaceObj = child
                aSelectedPlace = child.orgXmlObj.attributes['ref']
                aManualUse = true
                return true
              }
            }, this)
            // Objekt der Liste hinzufügen
            aPlaces.push({'fieldName': aField, 'xmlFieldName': xmlFieldName, 'selectedPlace': aSelectedPlace, 'use': true, 'manualUse': aManualUse, 'placeObj': aPlaceObj, 'option': aOption, 'places': this.content.fxData.places[aField]})
            peRest = true
          }
        }, this)
        // console.log('getPlacesEdit', aPlaces)
        return aPlaces
      },
      setPlace (place, sigle) {
        let spChanged = false
        if (place.selectedPlace !== sigle) {
          this.changed = true
          spChanged = true
        }
        place.selectedPlace = sigle
        let selPlace = this.placeBySigle(place.places, sigle)
        if (selPlace) {
          Object.keys(selPlace.parents).forEach((aParKey) => {
            let peSP = stdFunctions.getFirstObjectOfValueInPropertyOfArray(this.placesEdit, 'fieldName', aParKey)
            if (peSP && peSP.selectedPlace !== selPlace.parents[aParKey].sigle) {
              this.changed = true
              peSP.selectedPlace = selPlace.parents[aParKey].sigle
              spChanged = true
            }
          })
        }
        this.updateUse()
        return spChanged
      },
      togglePlaceUse (place) {
        if (place.selectedPlace) {
          place.use = !place.use
          place.manualUse = true
        }
      },
      updateUse () {
        if (this.content.parserObj.options.getOption('editor.fxFunction.autoUse') === 'justFirst') {
          let firstFound = false
          this.placesEdit.forEach(function (aPlace) {
            if (!firstFound && aPlace.selectedPlace) {
              if (!aPlace.manualUse) {
                aPlace.use = true
              }
              firstFound = true
            } else {
              if (!aPlace.manualUse) {
                aPlace.use = false
              }
            }
          }, this)
        }
      },
      saveValue () {
        let aError = false
        this.placesEdit.forEach(function (aPlace) {
          if (!this.isCorrectPlace(aPlace)) {
            aError = true
          }
        }, this)
        if (!aError || confirm('Die Eingabe ist Fehlerhaft! Trotzdem anwenden?')) {
          // Speichervorgang
          this.placesEdit.forEach(function (aPlace) {
            if (!aPlace.option || !aPlace.selectedPlace || !aPlace.use) {
              if (aPlace.placeObj) {
                aPlace.placeObj.delete(true)
              }
            } else {
              if (aPlace.placeObj) {
                if (aPlace.placeObj.orgXmlObj.attributes['ref'] !== aPlace.selectedPlace) {
                  aPlace.placeObj.orgXmlObj.setAttribute('ref', aPlace.selectedPlace)
                }
              } else {
                let nParser = this.content.add(null, this.content.fxData.placeParser, null, [], [], false, null, null, false)
                nParser.orgXmlObj.setAttribute('type', aPlace.xmlFieldName)
                nParser.orgXmlObj.setAttribute('ref', aPlace.selectedPlace)
              }
            }
          }, this)
          this.content.updateData(true)
          this.edit = false
          this.refreshSelect = true
          this.changed = false
        }
      },
      chancelValue () {
        if (!this.changed || confirm('Änderung verwerfen?')) {
          this.edit = false
          this.refreshSelect = true
          this.changed = false
        }
      },
      placeBySigle (places, sigle) {
        return stdFunctions.getFirstObjectOfValueInPropertyOfArray(places, 'sigle', sigle)
      },
      isCorrectPlace (place) {
        let isCorrect = true
        if (place.selectedPlace) {
          let aPlace = this.placeBySigle(place.places, place.selectedPlace)
          if (aPlace) {
            Object.keys(aPlace.parents).forEach(function (aParKey) {
              let peSP = stdFunctions.getFirstObjectOfValueInPropertyOfArray(this.placesEdit, 'fieldName', aParKey).selectedPlace
              if (peSP && aPlace.parents[aParKey].sigle !== peSP) {
                isCorrect = false
              }
            }, this)
          } else {
            isCorrect = false
          }
        } else if (!place.option.possible) {
          isCorrect = false
        }
        return isCorrect
      },
      isVisiblePlace (aPlace) {
        let isVisible = true
        Object.keys(aPlace.parents).forEach(function (aParKey) {
          let peSP = stdFunctions.getFirstObjectOfValueInPropertyOfArray(this.placesEdit, 'fieldName', aParKey).selectedPlace
          if (peSP && aPlace.parents[aParKey].sigle !== peSP) {
            isVisible = false
          }
        }, this)
        return isVisible
      },
      placesView () {
        let aPlaces = []
        this.content.getChilds('all', true).forEach(function (child) {
          if (child.orgXmlObj.name === 'placeName' && child.orgXmlObj.getValue(false)) {
            aPlaces.push(child)
          }
        }, this)
        return aPlaces
      },
      getFirstObjectOfValueInPropertyOfArray: stdFunctions.getFirstObjectOfValueInPropertyOfArray,
      dropdownFocusActive: _.debounce(function (key) {
        let aElement = this.$refs['dropdown'][key].$el.getElementsByClassName('dropdown-item active')[0]
        if (aElement) {
          aElement.focus()
        }
      }, 10),
      keyDown (e) {
        if (this.edit) {
          if (document.activeElement.closest('#gs' + this.content.uId) && !document.activeElement.closest('.dropdown-filter')) {
            if ((e.keyCode >= 65 && e.keyCode <= 90) || [186, 192, 222, 219].indexOf(e.keyCode) > -1) {
              this.$refs.dropdown.some(function (aDrDo, aKey) {
                if (aDrDo.visible) {
                  this.filter += e.key
                  e.preventDefault()
                  let dfEl = aDrDo.$el.getElementsByClassName('dropdown-filter')[0]
                  if (dfEl) {
                    dfEl.focus()
                  } else {
                    this.$nextTick(() => {
                      let dfEl = aDrDo.$el.getElementsByClassName('dropdown-filter')[0]
                      if (dfEl) {
                        dfEl.focus()
                      }
                    })
                  }
                  return true
                }
              }, this)
            }
          }
        }
      },
    },
    watch: {
      'edit' (nVal) {
        if (nVal) {
          this.placesEdit = this.getPlacesEdit()
          this.updateUse()
          this.$nextTick(() => {
            this.$refs['dropdown'][0].$el.getElementsByClassName('btn-val-focus')[0].focus()
          })
        }
      },
      'refreshSelect' (nVal) {
        if (nVal) {
          this.$nextTick(() => {
            this.refreshSelect = false
          })
        }
      },
      'filter' (nVal) {
        if (nVal === '') {
          this.$refs.dropdown.some((aDrDo, aKey) => {
            if (aDrDo.visible) {
              this.$nextTick(() => {
                let dfEl = aDrDo.$el.getElementsByClassName('dropdown-item active')[0]
                if (dfEl) {
                  dfEl.focus()
                }
              })
              return true
            }
          })
        }
      },
    },
    created () {
      window.addEventListener('keydown', this.keyDown)
    },
    beforeDestroy () {
      window.removeEventListener('keydown', this.keyDown)
    },
    components: {
    },
  }
</script>

<style scoped>
  .select {
    display: inline-block;
    position: relative;
    cursor: pointer;
    border: none;
    background: none;
    border-radius: 5px;
    padding: 0px 5px;
    text-align: left;
  }
  .select:hover {
    background: #eef;
  }
  .select.error {
    font-weight: bold;
    color: #dc3545;
  }
  .dropdown-item > .fa-icon {
    position: absolute;
    left: 5px;
    margin-top: 4px;
  }
  .b-dropdown {
    margin-top: -3px;
  }
  .geoselect.view {
    cursor: pointer;
  }
  span.warning {
    background: #fff4b9;
  }
  span.error-place {
    padding: 0 5px;
    background: #ee6;
    display: inline-block;
  }
  button.fx-btn {
    width: 25px;
    margin-left: 3px;
    text-align: center;
  }
  button.fx-btn:hover, button.fx-btn:focus {
    background: #bbb !important;
  }
  span.gsel {
    position: relative;
    display: inline-block;
  }
  span.field-name {
    font-size: 0.6rem;
    text-align: center;
    position: absolute;
    background: #888;
    color: #fff;
    padding: 0 5px;
    padding-top: 2px;
    border-radius: 3px;
    top: -15px;
    left: 1px;
    right: 1px;
  }
  .dropdown-item.not-possible {
    color: #d33;
    font-style: italic;
  }
  .dropdown-scrollarea {
    max-height: calc( 30vh - 2px );
    margin-right: -1px;
    overflow-y: auto;
  }
  .dropdown-scrollarea.filter {
    height: calc( 30vh - 27px );
  }
  .dropdown-filter {
    height: 25px;
    width: 100%;
  }
</style>
