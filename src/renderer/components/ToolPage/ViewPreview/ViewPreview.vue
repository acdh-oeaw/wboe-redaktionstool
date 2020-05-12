<template>
  <div class="start" v-if="start">
    <div ref="frm" class="row" v-if="object.contentObj">
      <div :class="showComments && Options.show.showCommentsList ? 'col-10' : 'col-12'">
        <div v-if="objectHasErrors">Bearbeiten nicht möglich!</div>
        <ViewPreview
          v-else
          :object="object"
          :preview="object.parserObj.previewObj"
          :commentsListe="commentsListe"
          :showAnchors="showAnchors"
          :showComments="showComments"
          @setAnchor="setAnchor"
          :selectableAnchors="selectableAnchors"
          :options="Options"
        />
      </div>
      <div class="col-2 commList" v-if="showComments && Options.show.showCommentsList">
        <template v-if="isCommentsListe">
          <div
            v-for="(aComments, aComsKey) in commentsListe.comments"
            :key="'cp' + aComsKey"
            :ref="'cp' + aComsKey"
            :style="'margin-top:' + (aComments.top > 0 ? aComments.top : 0) + 'px;'">
            <div class="comment-title"><b>{{ aComments.title }}:</b> {{ aComments.value }}</div>
            <ul class="comment-list">
              <li
                class="comment"
                v-for="(aComment, aComKey) in aComments.list"
                :key="'cp' + aComsKey + 'cott' + aComKey">
                {{ aComment.val }}
              </li>
            </ul>
          </div>
        </template>
        <template v-else>
          Keine Kommentare vorhanden.
        </template>
      </div>
    </div>
    <div v-else>
      Keine Content-Daten vorhanden
    </div>
  </div>

  <span v-else-if="!start && preview && object">
    <template v-for="(aPrev, aPrevKey) in preview">
      <VariableTag  
        :tag="aPrev.name"
        :attributes="aPrev.attributes"
        :key="'vt' + aPrevKey"
        v-if="aPrev.type === 'HTML'">
        <template v-for="(aContent, aConKey) in aPrev.content">
          <template v-if="typeof aContent === 'string'">
            <span v-html="aContent" :key="'sc' + aPrevKey + '-' + aConKey" />
          </template>
          <ViewPreview
            v-else
            :object="object"
            :options="Options"
            :preview="[aContent]"
            :commentsListe="commentsListe"
            :showAnchors="showAnchors"
            :showComments="showComments"
            @setAnchor="setAnchor"
            :selectableAnchors="selectableAnchors"
            :key="'vp' + aPrevKey + '-' + aConKey" />
        </template>
      </VariableTag>
      <template v-else-if="aPrev.type === 'PIN'">
        <PreviewContent
          v-if="aPrev.name === 'content' && aPrev.options && aPrev.options.fromid"
          :content="object.getEditorObjById(aPrev.options.fromid)"
          :commentsListe="commentsListe"
          :showAnchors="showAnchors"
          :showComments="showComments"
          @setAnchor="setAnchor"
          :selectableAnchors="selectableAnchors"
          :key="'pc' + aPrevKey" />
        <div
          v-else
          :key="'fbPIN' + aPrevKey">
          <b>Fehler bei "PIN": {{ aPrev.name }}</b>
        </div>
      </template>
      <template v-else>
        <b :key="'ut' + aPrevKey">UNBEKANNTER TYPE ({{ aPrev.type }})</b>
      </template>
    </template>
  </span>

  <div class="error" v-else>
    Kein "object/preview" übergeben !!!
  </div>
</template>

<script>
  import _ from 'lodash'
  import VariableTag from './VariableTag'
  import PreviewContent from './PreviewContent'

  export default {
    name: 'ViewPreview',
    props: {
      start: Boolean,
      object: Object,
      preview: Array,
      showAnchors: Boolean,
      showComments: Boolean,
      selectableAnchors: Boolean,
      commentsListe: Object,
      filename: String,
      options: Object
    },
    components: {
      VariableTag,
      PreviewContent
    },
    data () {
      return {
      }
    },
    computed: {
      isCommentsListe () {
        return this.commentsListe
          && this.commentsListe.comments
          && Object.keys(this.commentsListe.comments).length > 0
      },
      objectHasErrors () {
        return (this.object.errors && this.length(this.object.errors) > 0)
          || (this.object.orgXmlObj.errors && this.length(this.object.orgXmlObj.errors) > 0)
          || (this.object.parserObj.errors && this.length(this.object.parserObj.errors) > 0)
      },
      Options () {
        return this.options
      }
    },
    watch: {
      'commentsListe.comments' (nVal) {
        if (this.start) { this.debouncedHeights() }
      }
    },
    mounted () {
      // console.log(this.$props)
    },
    methods: {
      debouncedHeights: _.debounce(function () {
        this.getHeights()
      }, 100),
      getHeights () {
        let sumHeight = 0
        let frmTop = this.$refs.frm.getBoundingClientRect().top
        Object.keys(this.commentsListe.comments).forEach((cId) => {
          if (this.$refs['cp' + cId] && this.$refs['cp' + cId][0]) {
            let aY = this.commentsListe.comments[cId].el.getBoundingClientRect().top - frmTop
            let aHeight = this.$refs['cp' + cId][0].clientHeight
            let tsHeight = aY - sumHeight
            this.$set(this.commentsListe.comments[cId], 'top', tsHeight)
            sumHeight += aHeight + (tsHeight > 0 ? tsHeight : 0)
          }
        })
        console.log(this.commentsListe.comments)
      },
      getCommentPos (top, aEl) {
        // console.log(this.commentHeight)
        return 0
      },
      length (val) {
        if (Array.isArray(val)) {
          return val.length
        } else {
          return Object.keys(val).length
        }
      },
      setAnchor (data) {
        this.$emit('setAnchor', data)
      },
      commentsListeReset () {
        this.commentsListe.comments = {}
        console.log('commentsListeReset', this.commentsListe)
      }
    },
  }
</script>

<style scoped>
  .inline {
    display: inline;
  }
  .commList > div {
    position: relative;
  }
  .commList {
    border-left: 1px solid #ccc;
    color: #333;
    font-size: 0.8rem;
    overflow-wrap: break-word;
  }
  ul.comment-list {
    border-top: 1px solid #ddd;
    margin: 0;
    padding: 0.25rem 0;
    padding-left: 1.5rem;
    margin-bottom: 5px;
  }
  .comment-title {
    font-size: 0.7rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: -5px;
  }
  @media print {
    .col-10 {
      -ms-flex: 0 0 81%;
      flex: 0 0 81%;
      max-width: 81%;
    }
    .col-2 {
      -ms-flex: 0 0 19%;
      flex: 0 0 19%;
      max-width: 19%;
    }
  }
</style>
