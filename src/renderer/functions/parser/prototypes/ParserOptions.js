import xmlFunctions from '@/functions/XmlFunctions'
import stdFunctions from '@/functions/stdFunctions'
// import Parser from '../Parser'

const localFunctions = {
  init () {
    this.options = {
      'tagAsTitle': true
    }
    this.options = this.decompressOptions(this.options)
    this.ready = true
    this.useable = true
    return true
  },
  get (opt) {
    return stdFunctions.getValOfSubProp(this.options, opt)
  },
  getOptionValue (parserOptionValue, aOrgXmObj) {
    let aVal = ((typeof parserOptionValue === 'object') ? JSON.parse(JSON.stringify(parserOptionValue)) : parserOptionValue)
    if (typeof aVal === 'object') {
      if (aVal.fx === 'now') {
        let aDate = new Date()
        let aMonth = aDate.getMonth() + 1
        aVal = aDate.getFullYear() + '-' + ((aMonth < 10) ? '0' : '') + aMonth + '-' + ((aDate.getDate() < 10) ? '0' : '') + aDate.getDate()
      }
      if (aVal.fx === 'random') {
        let nVal = ''
        let pChr = aVal.fxCharset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let vLen = aVal.fxLen || 7
        for (var i = 0; i < vLen; i++) {
          nVal += pChr.charAt(Math.floor(Math.random() * pChr.length))
        }
        aVal = nVal
      }
      if (aVal.fx === 'orthId') {
        let nVal = ''
        if (aOrgXmObj) {
          let xVal = aOrgXmObj.getChildsByName('orth')
          if (xVal && xVal[0]) {
            xVal = xVal[0].getValue(false)
            if (xVal.trim().length > 0) {
              nVal = xVal.trim().replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss').replace(/[^a-zA-Z0-9._]/g, '_').replace(/^[^a-zA-Z]/g, '')
            }
          }
        }
        aVal = nVal
      }
    }
    return aVal
  },
  getResult (opt) {
    let aOpt = stdFunctions.getValOfSubProp(this.options, opt)
    let optName = opt.split('.')
    optName = optName[optName.length - 1]
    if (aOpt && typeof aOpt !== 'string') {
      if (optName === 'title') {
        if (!aOpt.use) {
          return null
        } else {
          return aOpt.value
        }
      } else {
        console.log('getResult', 'Unbekannte Option!', optName, aOpt)
        return JSON.stringify(aOpt)
      }
    }
    return aOpt
  },
  decompressOptions: xmlFunctions.decompressProcessingOptions,
  initFromParserObject (pObj) {
    // Atribute auswerten
    if (Object.keys(pObj.attributes).length > 0) {
      Object.keys(pObj.attributes).forEach(function (aKey) {
        if (!this.options.attributes) { this.options.attributes = {} }
        this.options.attributes[aKey] = {'value': pObj.attributes[aKey], 'type': 'fixed'}
      }, this)
    }
    return true
  },
  extendPreviewLayout () {
    this.options.previewLayout = this.combineObj(this.options.layout || {}, this.options.previewLayout || {})
  },
  extendJSON (jsonString, errObj) {
    try {
      if (this.extendObj(this.decompressOptions(JSON.parse(jsonString)))) {
        return true
      }
    } catch (err) {
      console.log(err)
      if (errObj) {
        let errArr = [err.toString()]
        let errRange = errArr[0].match(/position (\d+)/mi)
        if (errRange.length > 1) {
          errArr.push('Fehlerbereich: ' + ((errRange[1] > 20) ? '...' : '') + jsonString.substr(((errRange[1] > 20) ? errRange[1] - 20 : 0), 40).trim() + '...')
        }
        errObj.addError({'txt': 'Fehler im JSON-String! (extendJSON)', 'err': errArr})
      }
      return null
    }
  },
  extendObj (optionObj) {
    this.options = this.combineObj(this.options, optionObj)
    return true
  },
  combineObj: xmlFunctions.combineProcessingOptions,
}

export default localFunctions
