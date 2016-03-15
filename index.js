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

const couchPass = require('./couchPass.json')
const cradle = require('cradle')
const connection = new (cradle.Connection)(`127.0.0.1`, 5984, {
  auth: {
    username: couchPass.user,
    password: couchPass.pass
  }
})
const aeDb = connection.database('artendb')
const buildTaxonomiesNonLr = require('./src/buildTaxonomiesNonLr.js')
const buildTaxonomiesLr = require('./src/buildTaxonomiesLr.js')
const buildTaxObjectsFaunaLevel1 = require('./src/buildTaxObjectsFaunaLevel1.js')
const buildTaxObjectsFaunaLevel2 = require('./src/buildTaxObjectsFaunaLevel2.js')
const buildTaxObjectsFaunaLevel3 = require('./src/buildTaxObjectsFaunaLevel3.js')

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
    return buildTaxObjectsFaunaLevel3({ aeDb, taxFauna, taxObjectsFaunaLevel1, taxObjectsFaunaLevel2 })
  })
  .catch((error) => console.log(error))
