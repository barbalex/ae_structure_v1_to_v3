'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = function (db, taxFlora) {
  return new Promise((resolve, reject) => {
    db.view('artendb/prov_baumFlora', {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumFlora: ${error}`)
      const names = _.map(result, (row) => row.key[0])
      let taxObjectsFloraLevel1 = names.map((name) => {
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxFlora._id,
          Name: name
        }
      })
      db.save(taxObjectsFloraLevel1, (error, results) => {
        if (error) reject(`error saving taxObjectsFloraLevel1 ${error}`)
        // update taxObjectsFloraLevel1
        results.forEach((res, i) => {
          taxObjectsFloraLevel1[i]._rev = res.rev
        })
        resolve(taxObjectsFloraLevel1)
      })
    })
  })
}
