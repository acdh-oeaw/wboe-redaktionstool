<template>
  <b-dropdown variant="val-focus" no-caret>
    <template slot="button-content">
      <span class="select">{{ selectedText }}&nbsp;<font-awesome-icon icon="caret-down" class="fa-icon float-right"/></span>
    </template>
    <!-- ToDo: canBeEmpty !?! -->
    <b-dropdown-item @click="select(-1)" :active="selected === -1" v-if="empty">
      <font-awesome-icon icon="check" class="fa-icon" v-if="selected === -1"/> Kein Wert!
    </b-dropdown-item>
    <b-dropdown-item @click="select(aKey)" :active="selected === aKey" :key="aKey" v-for="(aVal, aKey) in aValues">
      <font-awesome-icon icon="check" class="fa-icon" v-if="aKey === selected"/> {{ aVal }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'SelectPossibleValues',
    props: {
      selected: Number,
      selectedText: String,
      values: Array,
      empty: Boolean,
    },
    data () {
      return {
      }
    },
    computed: {
      aValues () {
        let aValList = []
        this.values.forEach(function (aVal) {
          aValList.push(aVal.title || aVal.value || aVal)
        }, this)
        return aValList
      }
    },
    methods: {
      select (key) {
        this.$emit('select', key)
      }
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
  }
  .select:hover {
    background: #eef;
  }
  .dropdown-item > .fa-icon {
    position: absolute;
    left: 5px;
    margin-top: 4px;
  }
  .b-dropdown {
    margin-top: -3px;
  }
</style>
