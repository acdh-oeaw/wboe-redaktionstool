<template>
  <b-dropdown variant="val-focus" no-caret ref="dd" @hidden="deactivate" v-if="active">
    <template slot="button-content">
      <span class="select">{{ selectedText }}&nbsp;<font-awesome-icon icon="caret-down" class="fa-icon float-right"/></span>
    </template>
    <!-- ToDo: canBeEmpty !?! -->
    <b-dropdown-item @click="select(-1)" :active="selected === -1" v-if="empty">
      <font-awesome-icon icon="check" class="fa-icon" v-if="selected === -1"/> Kein Wert!
    </b-dropdown-item>
    <template v-for="(aVal, aKey) in aValues">
      <b-dropdown-item @click="select(aKey)" :active="selected === aKey" :key="aKey" v-if="!(aKey !== selected && aVal.hide)">
        <font-awesome-icon icon="check" class="fa-icon" v-if="aKey === selected"/> {{ aVal.title || aVal.value || aVal }}
      </b-dropdown-item>
    </template>
  </b-dropdown>
  <div class="dropdown b-dropdown btn-group" v-else>
    <button @click="activate" aria-haspopup="true" aria-expanded="false" type="button" class="btn dropdown-toggle btn-val-focus dropdown-toggle-no-caret">
      <span class="select">{{ selectedText }}&nbsp;<font-awesome-icon icon="caret-down" class="fa-icon float-right"/></span>
    </button>
  </div>
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
        active: false
      }
    },
    computed: {
      aValues () {
        let aValList = []
        this.values.forEach(function (aVal) {
          aValList.push(aVal)
        }, this)
        return aValList
      }
    },
    methods: {
      activate () {
        this.active = true
        this.$nextTick(() => {
          if (this.$refs.dd) {
            this.$refs.dd.show()
          }
        })
      },
      deactivate () {
        this.$nextTick(() => {
          this.active = false
        })
      },
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
