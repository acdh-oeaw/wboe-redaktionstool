<script>
  export default {
    name: 'VariableTag',
    props: ['tag', 'attributes'],
    data () {
      return {
      }
    },
    render: function (createElement) {
      let aData = {'class': {}, 'style': {}}
      Object.keys(this.attributes).forEach(function (aAttrKey) {
        if (aAttrKey === 'class') {
          let aClasses = ((this.attributes['class'] && typeof this.attributes['class'] === 'string') ? this.attributes['class'].split(' ') : [])
          aClasses.forEach(function (aClass) {
            aData.class[aClass] = true
          }, this)
        } else if (aAttrKey === 'style') {
          console.log('style wird nicht unterstützt!')
        } else {
          aData.attrs[aAttrKey] = this.attributes[aAttrKey]
        }
      }, this)
      return createElement(
        this.tag,
        aData,
        this.$slots.default
      )
    },
  }
</script>
