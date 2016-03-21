'use strict'

/*
 * Objekt neu aufbauen
 * damit die Reihenfolge passt und die Taxonomie die Gruppe enthält
 * Reihenfolge:
 * 1. Taxonomie
 * 2. Taxonomien
 * 3. Eigenschaftensammlungen
 * 4. Beziehungssammlungen
 */

const _ = require('lodash')
const uuid = require('node-uuid')

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
    let taxObjectsLr = []

    // loop through docs
    res.rows.forEach((row, index) => {
      const doc = row.doc

      // check needed fields
      if (!doc.Gruppe) return console.error(`doc hat keine Gruppe`, doc)
      if (!doc.Taxonomie) return console.error(`doc hat keine Taxonomie`, doc)
      if (!doc.Taxonomie.Eigenschaften) return console.error(`doc hat keine Taxonomie.Eigenschaften`, doc)

      // check fields that should exist
      if (!doc.Eigenschaftensammlungen) {
        console.log(`doc hatte keine Eigenschaftensammlungen`, doc)
        doc.Eigenschaftensammlungen = []
      }
      if (!doc.Beziehungssammlungen) {
        console.log(`doc hatte keine Beziehungssammlungen`, doc)
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
      if (doc.Gruppe === 'Lebensräume') {
        // this is lr > create Taxonomie-Objekt
        // first check needed fields
        if (!doc.Taxonomie.Eigenschaften.Parent) {
          return console.error(`lr hat keinen Taxonomie.Eigenschaften.Parent`, doc)
        } else if (!doc.Taxonomie.Name) {
          return console.error(`lr hat keinen Taxonomie.Name`, doc)
        } else {
          const taxonomie = lrTaxonomies.find((tax) => tax.Name === doc.Taxonomie.Name)
          if (!taxonomie) return console.error('für diese lr keine Taxonomie gefunden', doc)
          const name = doc.Label ? `${doc.Label}: ${doc.Einheit}` : doc.Einheit
          const parent = doc.Taxonomie.Eigenschaften.Parent
          const eigenschaften = doc.Taxonomie.Eigenschaften
          // remove Parent and Hierarchie
          if (eigenschaften.Parent) delete eigenschaften.Parent
          if (eigenschaften.Hierarchie) delete eigenschaften.Hierarchie
          const taxObj = {
            _id: uuid.v4(),
            Typ: 'Taxonomie-Objekt',
            Taxonomie: taxonomie._id,
            Name: name,
            Objekt: {
              id: doc._id,
              Eigenschaften: eigenschaften
            },
            parent: parent
          }
          // save this Taxonomie-Objekt
          aeDb.save(taxObj, (error, res) => {
            if (error) console.error('error saving taxObj', taxObj)
            // update taxObjectsLr
            taxObj._rev = res.rev
            taxObjectsLr.push(taxObj)
          })
        }
      }

      // remove Taxonomie(n)
      delete doc.Taxonomie
      if (doc.Taxonomie) delete doc.Taxonomien
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
