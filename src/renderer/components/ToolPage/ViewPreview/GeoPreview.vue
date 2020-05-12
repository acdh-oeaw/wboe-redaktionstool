<template>
  <span :id="'gs' + content.uId"><template v-for="(place, pKey) in placesView()"><template v-if="pKey > 0">{{ content.fxData.join }}</template>{{ place.orgXmlObj.getValue(false) }}</template></span>
</template>

<script>
  export default {
    name: 'GeoPreview',
    props: {
      content: Object,
    },
    data () {
      return {
        'placesEdit': [],
      }
    },
    computed: {
    },
    watch: {
    },
    mounted () {
    },
    methods: {
      placesView () {
        let aPlaces = []
        this.content.getChilds('all', true).forEach(function (child) {
          if (child.orgXmlObj.name === 'placeName' && child.orgXmlObj.getValue(false)) {
            aPlaces.push(child)
          }
        }, this)
        return aPlaces
      },
    },
    components: {
    },
  }
</script>

<style scoped>
</style>
