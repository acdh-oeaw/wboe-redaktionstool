import prototypeFilesystem from './prototypes/Filesystem'

const localFunctions = {
  Filesystem: function (options) {
    this.ready = false													// Ist das Objekt bereit?
    this.basePath = null												// Basisverzeichniss
    this.parserPath = null											// Verzeichniss für Parser Dateien
    this.paths = {loading: true, children: []}	// Cache für Verzeichnissstruktur
    this.parser = null													// Parser Basisdatei
    this.errors = {}														// Fehler.
    this.init(options)													// Immer dirket initialisieren
  },
}

// Filesystem Prototypen
localFunctions.Filesystem.prototype.init = prototypeFilesystem.init
localFunctions.Filesystem.prototype.update = prototypeFilesystem.update
localFunctions.Filesystem.prototype.updatePaths = prototypeFilesystem.updatePaths

export default localFunctions
