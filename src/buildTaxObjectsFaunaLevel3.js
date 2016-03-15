'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = function (aeDb, taxFauna, taxObjectsFaunaLevel1, taxObjectsFaunaLevel2) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumFauna', {
      group_level: 3
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const keys = _.map(result, (row) => row.key)
      let taxObjectsFaunaLevel3 = _.map(keys, (key) => {
        const taxonomie = taxFauna._id
        const klasseObjektName = key[0]
        const klasseObject = taxObjectsFaunaLevel1.find(
          (taxObj) => taxObj.Name === klasseObjektName
        )
        const ordnungName = key[1]
        const ordnungObject = taxObjectsFaunaLevel2.find(
          (taxObj) => taxObj.Name === ordnungName && taxObj.parent === klasseObject._id
        )
        const name = key[2]
        const parent = ordnungObject._id
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          parent: parent
        }
      })
      aeDb.save(taxObjectsFaunaLevel3, (error, results) => {
        if (error) reject(`error saving lr-taxonomies ${error}`)
        // update taxObjectsFaunaLevel3
        results.forEach((res, i) => {
          taxObjectsFaunaLevel3[i]._rev = res.rev
        })
        resolve(taxObjectsFaunaLevel3)
      })
    })
  })
}
