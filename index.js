'use strict'

/*
 * Taxonomie-Objekte aufbauen
 * 1. Taxonomien aufbauen
 *    do it manually
 * 2. für Taxonomie-Fauna:
 *    view baumFauna, group-level 1: level1-TaxObj bauen
 *    view baumFauna, group-level 2: level2-TaxObj bauen
 *    view baumFauna, group-level 3: level3-TaxObj bauen
 *    view baumFauna, group-level 5: level4-TaxObj bauen
 *    last level: update field Taxonomien of Objekt
 * 3. dito für Flora (level 1 bis 3),
 *    dito für Moose (level 1 bis 4),
 *    dito für Pilze (level 1 bis 2)
 */

/*
 * Taxonomie-Objekte für LR aufbauen
 *
 * use view baumLr because the order makes sure,
 * parent was always created first
 *
 * for every key in baumLr:
 * 1. create Taxonomie-Objekt from LR-Objekt:
 *    get Name from key[4]
 * 2. get child-object-guids from baumLr: level = level +1, parent = _id
 * 3. set field Taxonomien in Objekt
 *
 * when all are done:
 * create field children, using field child-object-guids
 * then remove field child-object-guids
 *
 */

/*
 * Objekt neu aufbauen
 * damit die Reihenfolge passt und die Taxonomie die Gruppe enthält
 * Reihenfolge:
 * 1. Taxonomie
 * 2. Taxonomien
 * 3. Eigenschaftensammlungen
 * 4. Beziehungssammlungen
 */

const couchPass = require('./couchPass.json')
const cradle = require('cradle')
const connection = new (cradle.Connection)(`127.0.0.1`, 5984, {
  auth: {
    username: couchPass.user,
    password: couchPass.pass
  }
})
const aeDb = connection.database('artendb')
const _ = require('lodash')
const buildTaxonomiesNonLr = require('./src/buildTaxonomiesNonLr.js')
const buildTaxonomiesLr = require('./src/buildTaxonomiesLr.js')
const buildTaxObjectsFaunaLevel1 = require('./src/buildTaxObjectsFaunaLevel1.js')
const buildTaxObjectsFaunaLevel2 = require('./src/buildTaxObjectsFaunaLevel2.js')

let nonLrTaxonomies = null
let taxonomies = null
let taxFauna = null
let taxObjectsFaunaLevel1 = null
let taxObjectsFaunaLevel2 = null

buildTaxonomiesNonLr(aeDb)
  .then((result) => {
    nonLrTaxonomies = result
    console.log('nonLrTaxonomies', nonLrTaxonomies)
    return buildTaxonomiesLr(aeDb)
  })
  .then((result) => {
    taxonomies = result
    console.log('taxonomies', taxonomies)
    // get id of CSCF (2009)
    taxFauna = taxonomies.find((taxonomy) => taxonomy.Name === 'CSCF (2009)')
    return buildTaxObjectsFaunaLevel1({ aeDb, taxFauna })
  })
  .then((result) => {
    taxObjectsFaunaLevel1 = result
    console.log('taxObjectsFaunaLevel1', taxObjectsFaunaLevel1)
    return buildTaxObjectsFaunaLevel2({ aeDb, taxFauna, taxObjectsFaunaLevel1 })
  })
  .then((result) => {
    taxObjectsFaunaLevel2 = result
    console.log('taxObjectsFaunaLevel2', taxObjectsFaunaLevel2)
    // return buildTaxObjectsFaunaLevel2({ aeDb, taxFauna, taxObjectsFaunaLevel1 })
  })
  .catch((error) => console.log(error))
  
const hierarchyFieldsOfGroups = {
  'Fauna': ['Klasse', 'Ordnung', 'Familie', 'Gattung'], // hat funktioniert
  'Flora': ['Familie', 'Gattung'], // Gattung fehlt!
  'Moose': ['Klasse', 'Familie', 'Gattung'], // Gattung fehlt!
  'Macromycetes': ['Gattung'] // Gattung fehlt!
}

let docsWritten = 0

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
