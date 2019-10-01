<template>
  <div class="info-page mib50">
    <div class="container">
      <br>
      <h2>Informationen</h2>
      <p>Programmiert von <b>Hans Christian Breuer</b> im Auftrag der <b>WBÖ</b>.</p>
      <h3>Verwendete Icons</h3>
      <p>
        <span class="icons" v-for="(aIcon, aKey) in icons" :key="'i' + aKey"><font-awesome-icon :icon="aIcon"/><b-badge variant="light"> {{ aIcon }} </b-badge></span>
      </p>
    </div>
  </div>
</template>

<script>
  import { library } from '@fortawesome/fontawesome-svg-core'

  export default {
    name: 'info-page',
    data () {
      return {
      }
    },
    computed: {
      icons () {
        return Object.keys(library.definitions.fas)
      }
    },
    watch: {
    },
    methods: {
    },
    mounted () {
    },
    components: {
    }
  }
</script>

<style scoped>
  .icons {
    display: inline-block;
    margin: 0 5px;
    border-radius: 5px;
    padding: 5px;
    padding-top: 1px;
  }
  .icons:hover {
    background-color: #333;
    color: #fff;
  }
  .icons > svg {
    margin-right: 5px;
    font-size: 1.1rem;
    position: relative;
    width: 1.25em;
    top: 3px;
  }
</style>
