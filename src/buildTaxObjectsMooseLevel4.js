'use strict'

const _ = require('lodash')
const uuid = require('node-uuid')

module.exports = (
  db,
  taxMoose,
  taxObjectsMooseLevel1,
  taxObjectsMooseLevel2,
  taxObjectsMooseLevel3,
  objects
) =>
  new Promise((resolve, reject) => {
    db.view('artendb/prov_baumMoose', {
      group_level: 5
    }, (error, result) => {
      if (error) reject(`error querying view baumMoose: ${error}`)
      const keys = _.map(result, (row) => row.key)
      const taxObjectsMooseLevel4 = _.map(keys, (key) => {
        const taxonomie = taxMoose._id
        const klasseObjektName = key[0]
        const klasseObject = taxObjectsMooseLevel1.find((taxObj) =>
          taxObj.Name === klasseObjektName
        )
        const familieObjektName = key[1]
        const familieObject = taxObjectsMooseLevel2.find((taxObj) =>
          taxObj.Name === familieObjektName && taxObj.parent === klasseObject._id
        )
        const gattungName = key[2]
        const gattungObject = taxObjectsMooseLevel3.find((taxObj) =>
          taxObj.Name === gattungName && taxObj.parent === familieObject._id
        )
        const name = key[3]
        const parent = gattungObject._id
        const objId = key[4]
        const object = objects.find((obj) =>
          obj._id === objId
        )
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
          parent
        }
      })
      db.save(taxObjectsMooseLevel4, (err, results) => {
        if (err) reject(`error saving taxObjectsMooseLevel4 ${err}`)
        // update taxObjectsMooseLevel4
        results.forEach((res, i) => {
          taxObjectsMooseLevel4[i]._rev = res.rev
        })
        resolve(taxObjectsMooseLevel4)
      })
    })
  })
