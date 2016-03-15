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
const getObjects = require('./src/getObjects.js')
const buildTaxonomiesNonLr = require('./src/buildTaxonomiesNonLr.js')
const buildTaxonomiesLr = require('./src/buildTaxonomiesLr.js')
const buildTaxObjectsFauna = require('./src/buildTaxObjectsFauna.js')

let objects = null
let taxonomies = null
let lrTaxonomies = null
let taxFauna = null
let taxObjectsFaunaLevel1 = null
let taxObjectsFaunaLevel2 = null
let taxObjectsFaunaLevel3 = null
let taxObjectsFaunaLevel4 = null

getObjects(aeDb)
  .then((result) => {
    objects = result
    console.log('objects', objects.slice(0, 2))
    return buildTaxonomiesNonLr(aeDb)
  })
  .then((result) => {
    taxonomies = result
    console.log('taxonomies', taxonomies.slice(0, 2))
    return buildTaxonomiesLr(aeDb)
  })
  .then((result) => {
    lrTaxonomies = result
    console.log('lrTaxonomies', lrTaxonomies.slice(0, 2))
    // get id of CSCF (2009)
    taxFauna = taxonomies.find((taxonomy) => taxonomy.Name === 'CSCF (2009)')
    return buildTaxObjectsFauna(aeDb, taxFauna, objects)
  })
  .then((result) => {
    taxObjectsFaunaLevel1 = result[0]
    taxObjectsFaunaLevel2 = result[1]
    taxObjectsFaunaLevel3 = result[2]
    taxObjectsFaunaLevel4 = result[3]
  })
  .catch((error) => console.log(error))
