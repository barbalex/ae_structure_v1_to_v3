'use strict'

const buildLrTaxonomieObject = require('./buildLrTaxonomieObject.js')
const setParentInLrTaxObjects = require('./setParentInLrTaxObjects.js')

let docsWritten = 0

module.exports = function (aeDb, lrTaxonomies) {
  function bulkSave (docs, end) {
    aeDb.save(docs, (error, result) => {
      if (error) return console.log('error after bulk:', error)
      docsWritten = docsWritten + docs.length
      console.log('docsWritten', docsWritten)
      if (end) setParentInLrTaxObjects(aeDb)
    })
  }
  aeDb.view('artendb/objekte', {
    'include_docs': true
  }, (error, res) => {
    if (error) console.log(error)

    let docs = []
    let docsPrepared = 0

    // loop through docs
    res.rows.forEach((row, index) => {
      const doc = row.doc

      // check needed fields
      if (!doc.Gruppe) {
        console.error(`doc hat keine Gruppe`, doc)
      } else if (!doc.Taxonomie) {
        console.error(`doc hat keine Taxonomie`, doc)
      } else if (!doc.Taxonomie.Eigenschaften) {
        console.error(`doc hat keine Taxonomie.Eigenschaften`, doc)
      } else {
        // check fields that should exist
        if (!doc.Eigenschaftensammlungen) {
          console.log(`Eigenschaftensammlungen mussten ergänzt werden`, doc)
          doc.Eigenschaftensammlungen = []
        }
        if (!doc.Beziehungssammlungen) {
          console.log(`Beziehungssammlungen mussten ergänzt werden`, doc)
          doc.Beziehungssammlungen = []
        }

        // add org to all objects...
        doc['Organisation mit Schreibrecht'] = 'FNS Kt. ZH'
        // ...to all property collections...
        doc.Eigenschaftensammlungen.forEach((es, index) => {
          doc.Eigenschaftensammlungen[index]['Organisation mit Schreibrecht'] = 'FNS Kt. ZH'
        })
        // ...and to all relation collections
        doc.Beziehungssammlungen.forEach((es, index) => {
          doc.Beziehungssammlungen[index]['Organisation mit Schreibrecht'] = 'FNS Kt. ZH'
        })

        // build taxonomie-Objekte for LR
        if (doc.Gruppe === 'Lebensräume') buildLrTaxonomieObject(aeDb, doc, index, lrTaxonomies)

        // remove Taxonomie(n)
        delete doc.Taxonomie
        if (doc.Taxonomien) delete doc.Taxonomien

        docs.push(doc)
      }

      if ((docs.length > 600) || (index === res.rows.length - 1)) {
        docsPrepared = docsPrepared + docs.length
        console.log('docsPrepared', docsPrepared)
        const end = index === res.rows.length - 1
        // save 600 docs
        bulkSave(docs.splice(0, 600), end)
      }
    })
  })
}
