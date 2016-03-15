'use strict'

const _ = require('lodash')

module.exports = function (aeDb, taxFauna, taxObjectsFaunaLevel1) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumFauna', {
      group_level: 2
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const keys = _.map(result, (row) => row.key)
      let taxObjectsFaunaLevel2 = _.map(keys, (key) => {
        const taxonomie = taxFauna._id
        const klasseName = key[0]
        const klasseObject = taxObjectsFaunaLevel1.find((taxObj) => taxObj.Name === klasseName)
        console.log('buildTaxObjectsFaunaLevel2, taxObjectsFaunaLevel1', taxObjectsFaunaLevel1.slice(0, 3))
        console.log('buildTaxObjectsFaunaLevel2, key', key)
        console.log('buildTaxObjectsFaunaLevel2, klasseName', klasseName)
        console.log('buildTaxObjectsFaunaLevel2, klasseObject', klasseObject)
        const name = key[1]
        const parent = klasseObject._id
        return {
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          parent: parent
        }
      })
      aeDb.save(taxObjectsFaunaLevel2, (error, results) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        // update taxObjectsFaunaLevel2
        results.forEach((res, i) => {
          let taxObj = taxObjectsFaunaLevel2[i]
          taxObj._id = res.id
          taxObj._rev = res.rev
        })
        resolve(taxObjectsFaunaLevel2)
      })
    })
  })
}
