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

const hierarchyFieldsOfGroups = {
  'Fauna': ['Klasse', 'Ordnung', 'Familie', 'Gattung'],
  'Flora': ['Familie', 'Gattung'],
  'Moose': ['Klasse', 'Familie', 'Gattung'],
  'Macromycetes': ['Gattung']
}

let docsWritten = 0

module.exports = function (aeDb) {
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

      // add org to all objects...
      if (doc.Gruppe) doc['Organisation mit Schreibrecht'] = 'FNS Kt. ZH'

      // ...to all property collections...
      if (doc.Eigenschaftensammlungen) {
        doc.Eigenschaftensammlungen.forEach((es, index) => {
          doc.Eigenschaftensammlungen[index]['Organisation mit Schreibrecht'] = 'FNS Kt. ZH'
        })
      }
      // ...and to all relation collections
      if (doc.Beziehungssammlungen) {
        doc.Beziehungssammlungen.forEach((es, index) => {
          doc.Beziehungssammlungen[index]['Organisation mit Schreibrecht'] = 'FNS Kt. ZH'
        })
      }

      // build taxonomien
      if (doc.Gruppe && doc.Taxonomie && doc.Taxonomie.Eigenschaften) {
        let neueTax = _.cloneDeep(doc.Taxonomie)
        if (doc.Gruppe === 'Lebensräume' && neueTax.Eigenschaften.Parent) {
          // lr: remove parent. Only keep Hierarchie
          if (!neueTax.Eigenschaften.Parent) {
            console.log(`lr ${doc._id} hat keinen Parent`)
          } else if (!neueTax.Eigenschaften.Hierarchie) {
            console.log(`lr ${doc._id} hat keine Hierarchie`)
          } else {
            delete neueTax.Eigenschaften.Parent
          }
        } else {
          // this is a species
          // need to build Hierarchie
          let hierarchy = []
          const hierarchyFields = hierarchyFieldsOfGroups[doc.Gruppe]
          if (hierarchyFields) {
            hierarchyFields.forEach((field, index) => {
              if (neueTax.Eigenschaften[field]) {
                hierarchy.push({
                  Name: neueTax.Eigenschaften[field]
                })
              } else {
                hierarchy.push({
                  Name: `(unbekannte ${field} + )`
                })
              }
            })
            hierarchy.push({
              'Name': neueTax.Eigenschaften['Artname vollständig'],
              'GUID': doc._id
            })
            neueTax.Eigenschaften.Hierarchie = hierarchy
          } else {
            console.log(`doc ${doc._id} has no hierarchyFields`)
          }
        }
        // set this taxonomy as standard
        neueTax.Standardtaxonomie = true
        // add org mit schreibrecht
        neueTax['Organisation mit Schreibrecht'] = 'FNS Kt. ZH'

        // now manipulate order of properties
        // first clone es and bs
        const newEs = _.cloneDeep(doc.Eigenschaftensammlungen)
        const newBs = _.cloneDeep(doc.Beziehungssammlungen)
        // remove old versions
        delete doc.Taxonomie
        if (doc.Eigenschaftensammlungen) delete doc.Eigenschaftensammlungen
        if (doc.Beziehungssammlungen) delete doc.Beziehungssammlungen
        // now add in wanted order
        doc.Taxonomien = [neueTax]
        doc.Eigenschaftensammlungen = newEs
        doc.Beziehungssammlungen = newBs

        docs.push(doc)

        if ((docs.length > 600) || (index === res.rows.length - 1)) {
          docsPrepared = docsPrepared + docs.length
          console.log('docsPrepared', docsPrepared)
          // save 600 docs
          bulkSave(docs.splice(0, 600))
        }
      } else {
        console.log(`doc ${doc._id} has no Gruppe or no Taxonomie`)
      }
    })
  })
}
