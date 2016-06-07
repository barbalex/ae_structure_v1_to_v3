'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = function (db, taxFlora, taxObjectsFloraLevel1, taxObjectsFloraLevel2, objects) {
  return new Promise((resolve, reject) => {
    db.view('artendb/prov_baumFlora', {
      group_level: 4
    }, (error, result) => {
      if (error) reject(`error querying view baumFlora: ${error}`)
      const keys = _.map(result, (row) => row.key)
      let taxObjectsFloraLevel3 = _.map(keys, (key) => {
        const taxonomie = taxFlora._id
        const familieObjektName = key[0]
        const familieObject = taxObjectsFloraLevel1.find(
          (taxObj) => taxObj.Name === familieObjektName
        )
        const gattungName = key[1]
        const gattungObject = taxObjectsFloraLevel2.find(
          (taxObj) => taxObj.Name === gattungName && taxObj.parent === familieObject._id
        )
        const name = key[2]
        const parent = gattungObject._id
        const objId = key[3]
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
      db.save(taxObjectsFloraLevel3, (error, results) => {
        if (error) reject(`error saving taxObjectsFloraLevel3 ${error}`)
        // update taxObjectsFloraLevel3
        results.forEach((res, i) => {
          taxObjectsFloraLevel3[i]._rev = res.rev
        })
        resolve(taxObjectsFloraLevel3)
      })
    })
  })
}
