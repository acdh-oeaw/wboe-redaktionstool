<template>
  <ul v-if="base || Array.isArray(aError)">
    <li v-for="(errorObj, errKey) in aError" :key="'el' + errKey">
      <b v-if="fxUseErrKey(errKey)">{{ fxErrKey(errKey) }}</b><ErrorContent :error="errorObj" :noObj="fxUseErrKey(errKey)" @goto="goto"/>
    </li>
  </ul>
  <span v-else-if="typeof aError === 'string'">{{ aError }}<br></span>
  <span @click="goto(aError.obj, true)" :class="hasObj ? 'clickable' : ''" v-else>
    <b v-if="aError.obj && !noObj">{{ aError.obj.uId }} - {{ aError.obj.orgXmlObj && aError.obj.orgXmlObj.name ? aError.obj.orgXmlObj.name + ' - ' : ''}}</b>
    <ErrorContent :error="aError.txt" v-if="aError.txt" @goto="goto"/>
    <div v-if="aError.sErr">{{ aError.sErr }}</div>
    <div v-if="Array.isArray(aError.err)" class="subArray"><ErrorContent :error="aError.err" @goto="goto"/></div>
    <ErrorContent :error="aError.err" v-else-if="aError.err" @goto="goto"/>
  </span>
</template>

<script>
  export default {
    name: 'ErrorContent',
    props: ['error', 'base', 'noObj'],
    data () {
      return {
      }
    },
    mounted () {
      // console.log(this.error, this.aError)
    },
    computed: {
      aError () {
        if (Array.isArray(this.error) && this.error.length === 1) {
          return this.error[0]
        } else {
          return this.error
        }
      },
      hasObj () {
        if (this.aError.obj) {
          return true
        }
      },
    },
    methods: {
      fxUseErrKey (key) {
        if (typeof key === 'string' && key.indexOf('-') > -1 && key.split('-')[0] !== key.split('-')[1]) {
          return true
        }
      },
      fxErrKey (key) {
        if (typeof key === 'string' && key.indexOf('-') > -1 && key.split('-')[0] !== key.split('-')[1]) {
          return key + ' - '
        }
        return ''
      },
      goto (aObj, show) {
        if (aObj) {
          if (show) {
            console.log('uId: ' + aObj.uId, aObj)
          }
          this.$emit('goto', aObj)
        }
      },
    }
  }
</script>

<style scoped>
  .subArray {
    display: inline-flex;
  }
  .subArray > ul {
    padding-left: 20px;
  }
  .clickable {
    cursor: pointer;
  }
</style>
