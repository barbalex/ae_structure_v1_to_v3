'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = function (sourceDb, aeDb, taxMoose, taxObjectsMooseLevel1) {
  return new Promise((resolve, reject) => {
    sourceDb.view('ae/prov_baumMoose', {
      group_level: 2
    }, (error, result) => {
      if (error) reject(`error querying view baumMoose: ${error}`)
      const keys = _.map(result, (row) => row.key)
      let taxObjectsMooseLevel2 = _.map(keys, (key) => {
        const taxonomie = taxMoose._id
        const klasseName = key[0]
        const klasseObject = taxObjectsMooseLevel1.find((taxObj) => taxObj.Name === klasseName)
        const name = key[1]
        const parent = klasseObject._id
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          parent: parent
        }
      })
      aeDb.save(taxObjectsMooseLevel2, (error, results) => {
        if (error) reject(`error saving taxObjectsMooseLevel2 ${error}`)
        // update taxObjectsMooseLevel2
        results.forEach((res, i) => {
          taxObjectsMooseLevel2[i]._rev = res.rev
        })
        resolve(taxObjectsMooseLevel2)
      })
    })
  })
}
