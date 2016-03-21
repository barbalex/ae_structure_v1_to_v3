'use strict'

/*
 * Objekt neu aufbauen
 * damit die Reihenfolge passt und die Taxonomie die Gruppe enthält
 * Reihenfolge:
 * 1. Eigenschaftensammlungen
 * 2. Beziehungssammlungen
 *
 * bei LR: LR-Taxonomie-Objekte bauen
 */

const _ = require('lodash')
const buildLrTaxonomieObject = require('./buildLrTaxonomieObject.js')

let docsWritten = 0

module.exports = function (aeDb, lrTaxonomies) {
  function bulkSave (docs) {
    aeDb.save(docs, (error, result) => {
      if (error) return console.log('error after bulk:', error)
      docsWritten = docsWritten + docs.length
      console.log('docsWritten', docsWritten)
    })
  }

  aeDb.view('artendb/objekte', {
    'include_docs': true
  }, (error, res) => {
    if (error) return console.log(error)

    let docs = []
    let docsPrepared = 0

    // loop through docs
    res.rows.forEach((row, index) => {
      const doc = row.doc

      // check needed fields
      if (!doc.Gruppe) return console.error(`doc hat keine Gruppe`, doc)
      if (!doc.Taxonomie) return console.error(`doc hat keine Taxonomie`, doc)
      if (!doc.Taxonomie.Eigenschaften) return console.error(`doc hat keine Taxonomie.Eigenschaften`, doc)

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

      // build taxonomie-Objekte for LR, remove Taxonomie(n)
      if (doc.Gruppe === 'Lebensräume') buildLrTaxonomieObject(aeDb, doc, index, lrTaxonomies)

      // remove Taxonomie(n)
      delete doc.Taxonomie
      if (doc.Taxonomien) delete doc.Taxonomien
      // now manipulate order of properties
      // first clone es and bs
      const newEs = _.cloneDeep(doc.Eigenschaftensammlungen)
      const newBs = _.cloneDeep(doc.Beziehungssammlungen)
      // remove old versions
      delete doc.Eigenschaftensammlungen
      delete doc.Beziehungssammlungen
      // now add in wanted order
      doc.Eigenschaftensammlungen = newEs
      doc.Beziehungssammlungen = newBs

      docs.push(doc)

      if ((docs.length > 600) || (index === res.rows.length - 1)) {
        docsPrepared = docsPrepared + docs.length
        console.log('docsPrepared', docsPrepared)
        // save 600 docs
        bulkSave(docs.splice(0, 600))
      }
    })
  })
}
