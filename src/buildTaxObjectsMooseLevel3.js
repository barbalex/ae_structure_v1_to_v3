'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = function (aeDb, taxMoose, taxObjectsMooseLevel1, taxObjectsMooseLevel2, objects) {
  return new Promise((resolve, reject) => {
    aeDb.view('artendb/baumMoose', {
      group_level: 4
    }, (error, result) => {
      if (error) reject(`error querying view baumMoose: ${error}`)
      const keys = _.map(result, (row) => row.key)
      let taxObjectsMooseLevel3 = _.map(keys, (key) => {
        const taxonomie = taxMoose._id
        const klasseObjektName = key[0]
        const klasseObject = taxObjectsMooseLevel1.find(
          (taxObj) => taxObj.Name === klasseObjektName
        )
        const gattungName = key[1]
        const gattungObject = taxObjectsMooseLevel2.find(
          (taxObj) => taxObj.Name === gattungName && taxObj.parent === klasseObject._id
        )
        const name = key[2]
        const parent = gattungObject._id
        const objId = key[4]
        const object = objects.find((obj) => obj._id === objId)
        const eigenschaften = object.Taxonomie.Eigenschaften
        return {
          _id: uuid.v4(),
          Typ: 'Taxonomie-Objekt',
          Taxonomie: taxonomie,
          Name: name,
          Objekt: {
            id: objId,
            Eigenschaften: eigenschaften
          },
          parent: parent
        }
      })
      aeDb.save(taxObjectsMooseLevel3, (error, results) => {
        if (error) reject(`error saving taxObjectsMooseLevel3 ${error}`)
        // update taxObjectsMooseLevel3
        results.forEach((res, i) => {
          taxObjectsMooseLevel3[i]._rev = res.rev
        })
        resolve(taxObjectsMooseLevel3)
      })
    })
  })
}
