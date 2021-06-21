const localFunctions = {
  geoPreview (content, geoStore) {
    let html = ''
    // html += '<span id="gs' + content.uId + '">'
    content.getChilds('all', true).filter(c => {
      return c.orgXmlObj.name === 'placeName' && c.orgXmlObj.getValue(false)
    }).forEach((pv, i) => {
      html += '<span data-geo-sigle="' + (getPlacenameSigleFromRef(pv.orgXmlObj.attributes.ref) || '') + '">'
      if (i > 0) {
        html += content.fxData.join
      }
      html += pv.orgXmlObj.getValue(false)
      html += maybeGrossregion(pv, geoStore)
      html += '</span>'
    })
    // html += '</span>'
    return html
  },
}

function last (array) {
  return array[array.length - 1]
}
function getGrossregionFromSigle (sigle, geoStore) {
  if (geoStore && geoStore.grossregionen) {
    const s = sigle.split(/([a-z])/)[0]
    const g = geoStore.grossregionen.features.find((f) => {
      return f.properties.Sigle === s
    })
    return g ? g.properties.Grossreg : null
  } else {
    return null
  }
}
function getPlacenameSigleFromRef (ref) {
  if (ref === null) {
    return null
  } else {
    return last(ref.split(/([#p])/)) || null
  }
}
function maybeGrossregion (place, geoStore) {
  if (
    place.orgXmlObj !== undefined
    && place.orgXmlObj.attributes !== undefined
    && place.orgXmlObj.attributes.ref !== undefined
  ) {
    // TODO: resolve the Großregion
    let out = null
    const sigle = getPlacenameSigleFromRef(place.orgXmlObj.attributes.ref) || null
    if (place.orgXmlObj.attributes.type === 'gemeinde') {
      out = getGrossregionFromSigle(sigle, geoStore)
    } else if (place.orgXmlObj.attributes.type === 'kleinregion') {
      out = getGrossregionFromSigle(sigle, geoStore)
    }
    return out
      ? ', ' + out
      : ''
  } else {
    return ''
  }
}
export default localFunctions
