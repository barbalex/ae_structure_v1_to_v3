'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = function (aeDb, taxMoose) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumMoose', {
      group_level: 1
    }, (error, result) => {
      if (error) reject(`error querying view baumMoose: ${error}`)
      const names = _.map(result, (row) => row.key[0])
      let taxObjectsMooseLevel1 = names.map((name) => {
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxMoose._id,
          Name: name
        }
      })
      aeDb.save(taxObjectsMooseLevel1, (error, results) => {
        if (error) reject(`error saving taxObjectsMooseLevel1 ${error}`)
        // update taxObjectsMooseLevel1
        results.forEach((res, i) => {
          taxObjectsMooseLevel1[i]._rev = res.rev
        })
        resolve(taxObjectsMooseLevel1)
      })
    })
  })
}
