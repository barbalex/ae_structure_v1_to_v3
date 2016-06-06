'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = function (sourceDb, aeDb, taxPilze) {
  return new Promise((resolve, reject) => {
    sourceDb.view('ae/prov_baumMacromycetes', {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumMacromycetes: ${error}`)
      const names = _.map(result, (row) => row.key[0])
      let taxObjectsPilzeLevel1 = names.map((name) => {
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxPilze._id,
          Name: name
        }
      })
      aeDb.save(taxObjectsPilzeLevel1, (error, results) => {
        if (error) reject(`error saving taxObjectsPilzeLevel1 ${error}`)
        // update taxObjectsPilzeLevel1
        results.forEach((res, i) => {
          taxObjectsPilzeLevel1[i]._rev = res.rev
        })
        resolve(taxObjectsPilzeLevel1)
      })
    })
  })
}
