'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = function (db, taxFauna) {
  return new Promise((resolve, reject) => {
    db.view('artendb/prov_baumFauna', {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumFauna: ${error}`)
      const names = _.map(result, (row) => row.key[0])
      let taxObjectsFaunaLevel1 = names.map((name) => {
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxFauna._id,
          Name: name
        }
      })
      db.save(taxObjectsFaunaLevel1, (error, results) => {
        if (error) reject(`error saving taxObjectsFaunaLevel1 ${error}`)
        // update taxObjectsFaunaLevel1
        results.forEach((res, i) => {
          taxObjectsFaunaLevel1[i]._rev = res.rev
        })
        resolve(taxObjectsFaunaLevel1)
      })
    })
  })
}
