const localFunctions = {
  updateData (eObj, first) {
    console.log('FxRefBiblSelect', first, eObj)
    if (!eObj.fxFunction) {
      // console.log('RefBiblSelect - updateData new')
      eObj.fxFunction = 'RefBiblSelect'
      eObj.fxData.belege = eObj.parserObj.root.additionalFiles[eObj.parserObj.options.get('editor.fxFunction.filename')].JSON
    }
  }
}

export default localFunctions
