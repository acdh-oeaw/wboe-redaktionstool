<template>
  <div id="wrapper">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue"> -->
    <main>
      <div class="left-side">
        <span class="title">
          Welcome to your new project!!
        </span>
        <system-information></system-information>
      </div>

      <div class="right-side">
        <b-alert show>Default Alert</b-alert>
      </div>
    </main>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'

  export default {
    name: 'landing-page',
    components: { SystemInformation },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
  /* @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro'); */

</style>
